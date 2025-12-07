import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, X, Download, Loader2 } from 'lucide-react';
import { api, endpoints } from '../../../services/api'; // Импорт API
import { wsService } from '../../../services/socket';   // Импорт WS

type ImportStep = 'upload' | 'mapping' | 'validation' | 'processing' | 'complete';

interface ParsedData {
  headers: string[];
  rows: any[][];
  rawData: string;
}

interface ValidationResult {
  row: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export function ImportData() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // Для парсинга на клиенте
  const [isUploading, setIsUploading] = useState(false);   // Для отправки на бэк

  const steps = [
    { id: 'upload', label: 'Загрузка' },
    { id: 'mapping', label: 'Маппинг' },
    { id: 'validation', label: 'Валидация' },
    { id: 'complete', label: 'Готово' },
  ];

  const targetFields = [
    { id: 'id', label: 'ID дефекта', required: true },
    { id: 'type', label: 'Тип дефекта', required: true },
    { id: 'severity', label: 'Уровень серьезности', required: true },
    { id: 'method', label: 'Метод инспекции', required: true },
    { id: 'latitude', label: 'Широта', required: true },
    { id: 'longitude', label: 'Долгота', required: true },
    { id: 'date', label: 'Дата обнаружения', required: true },
    { id: 'pipeline', label: 'Трубопровод', required: false },
    { id: 'notes', label: 'Примечания', required: false },
  ];

  // --- ЛОГИКА ОТПРАВКИ НА БЭКЕНД ---
  const handleFinalImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true); // Включаем спиннер

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // 1. Отправляем файл
      const res = await api.post(endpoints.import, formData);
      const uuid = res.data.id;

      console.log("File uploaded, waiting for WS processing...", uuid);

      // 2. Слушаем WebSocket по UUID загрузки
      wsService.subscribe(uuid, (data: any) => {
        console.log("WS Import update:", data);
        
        if (data.status === 'done') {
           setIsUploading(false);
           setCurrentStep('complete');
           wsService.unsubscribe(uuid, () => {}); // Отписка (упрощенно)
        } else if (data.status === 'error') {
           setIsUploading(false);
           alert('Ошибка импорта на сервере!');
        }
      });

      // Переходим в режим ожидания (можно сделать отдельный шаг, но пока оставим спиннер)
      
    } catch (e) {
      console.error("Upload failed", e);
      setIsUploading(false);
      alert("Не удалось загрузить файл на сервер");
    }
  };
  // ----------------------------------

  const parseCSV = (text: string): ParsedData => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [], rawData: text };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const rows = lines.slice(1).map(line => {
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      return values;
    });

    return { headers, rows, rawData: text };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      
      const autoMappings: Record<string, string> = {};
      parsed.headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('id')) autoMappings[index] = 'id';
        else if (lowerHeader.includes('type')) autoMappings[index] = 'type';
        else if (lowerHeader.includes('severity')) autoMappings[index] = 'severity';
        else if (lowerHeader.includes('method')) autoMappings[index] = 'method';
        else if (lowerHeader.includes('lat')) autoMappings[index] = 'latitude';
        else if (lowerHeader.includes('lon')) autoMappings[index] = 'longitude';
        else if (lowerHeader.includes('date')) autoMappings[index] = 'date';
        else if (lowerHeader.includes('pipeline')) autoMappings[index] = 'pipeline';
        else if (lowerHeader.includes('note')) autoMappings[index] = 'notes';
      });
      
      setColumnMappings(autoMappings);
    } catch (error) {
      console.error('Ошибка парсинга файла:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'mapping') {
      performValidation();
    }
    
    const stepOrder: ImportStep[] = ['upload', 'mapping', 'validation', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const performValidation = () => {
    if (!parsedData) return;

    const results: ValidationResult[] = [];
    const requiredFields = targetFields.filter(f => f.required).map(f => f.id);

    parsedData.rows.forEach((row, rowIndex) => {
      const mappedValues: Record<string, string> = {};
      Object.entries(columnMappings).forEach(([colIndex, targetField]) => {
        mappedValues[targetField] = row[parseInt(colIndex)] || '';
      });

      const missingFields = requiredFields.filter(field => !mappedValues[field]);
      
      if (missingFields.length > 0) {
        results.push({
          row: rowIndex + 1,
          status: 'error',
          message: `Отсутствуют обязательные поля: ${missingFields.join(', ')}`
        });
      } else {
        const severity = mappedValues.severity?.toLowerCase();
        if (severity && !['critical', 'high', 'medium', 'low'].includes(severity)) {
          results.push({
            row: rowIndex + 1,
            status: 'warning',
            message: `Некорректное значение severity: "${mappedValues.severity}"`
          });
        } else {
          results.push({
            row: rowIndex + 1,
            status: 'success',
            message: 'Запись корректна'
          });
        }
      }
    });

    setValidationResults(results);
  };

  const downloadTemplate = () => {
    const template = `id,type,severity,method,latitude,longitude,date,pipeline,notes
DEF-001,Corrosion,critical,ILI,48.5,68.2,2024-01-15,PL-001,External corrosion detected`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setParsedData(null);
    setColumnMappings({});
    setValidationResults([]);
    setIsUploading(false);
  };

  const validCount = validationResults.filter(r => r.status === 'success').length;
  const warningCount = validationResults.filter(r => r.status === 'warning').length;
  const errorCount = validationResults.filter(r => r.status === 'error').length;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Импорт данных</h1>
          <p className="text-slate-600">
            Импортируйте данные о дефектах и инспекциях из CSV файлов
          </p>
        </div>

        {/* Кнопка скачивания шаблона */}
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Скачать шаблон CSV
          </button>
        </div>

        {/* Прогресс */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isComplete = steps.findIndex((s) => s.id === currentStep) > index;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isComplete
                          ? 'bg-green-600 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        isActive ? 'text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-slate-200 mx-4 mt-[-24px]"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Контент шага */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {/* Шаг загрузки */}
          {currentStep === 'upload' && (
            <div>
              <h2 className="text-slate-900 mb-4">Загрузите файл данных</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 mb-2">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Выбрать файл
                </label>
              </div>
              {selectedFile && parsedData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-slate-900">{selectedFile.name}</p>
                      <p className="text-slate-600">
                        {(selectedFile.size / 1024).toFixed(2)} KB • {parsedData.rows.length} строк данных
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setParsedData(null);
                      }}
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    Продолжить
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Шаг сопоставления */}
          {currentStep === 'mapping' && parsedData && (
            <div>
              <h2 className="text-slate-900 mb-4">Сопоставьте колонки</h2>
              <div className="space-y-4">
                {parsedData.headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-700">{header}</p>
                      <p className="text-slate-500 text-sm">
                        Пример: {parsedData.rows[0]?.[index] || 'N/A'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <select
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      value={columnMappings[index] || ''}
                      onChange={(e) => {
                        setColumnMappings({
                          ...columnMappings,
                          [index]: e.target.value,
                        });
                      }}
                    >
                      <option value="">Выберите поле...</option>
                      {targetFields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.label} {field.required ? '(обязательно)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={handleNextStep}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Валидировать данные
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Шаг валидации */}
          {currentStep === 'validation' && (
            <div>
              <h2 className="text-slate-900 mb-4">Результаты валидации</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-slate-700 mb-1">Корректные</p>
                  <p className="text-green-600 font-bold">{validCount}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-slate-700 mb-1">Предупреждения</p>
                  <p className="text-yellow-600 font-bold">{warningCount}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-slate-700 mb-1">Ошибки</p>
                  <p className="text-red-600 font-bold">{errorCount}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {validationResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      result.status === 'success' ? 'bg-green-50 border-green-200' :
                      result.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className={`w-5 h-5 ${result.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
                    )}
                    <div className="flex-1">
                      <p className="text-slate-900">Строка {result.row}</p>
                      <p className="text-slate-600 text-sm">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопка отправки на сервер */}
              <button
                onClick={handleFinalImport}
                disabled={errorCount > 0 || isUploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Обработка на сервере...
                    </>
                ) : (
                    <>
                        Импортировать данные
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
              </button>
              
              {errorCount > 0 && (
                <p className="mt-2 text-red-600 text-sm">
                  Исправьте ошибки перед импортом
                </p>
              )}
            </div>
          )}

          {/* Шаг завершения */}
          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-slate-900 mb-2">Импорт успешно завершен!</h2>
              <p className="text-slate-600 mb-6">
                Данные обработаны сервером и добавлены в базу данных.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetImport}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                >
                  Импортировать еще
                </button>
                <button
                  onClick={() => window.location.href = '/map'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Посмотреть на карте
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}