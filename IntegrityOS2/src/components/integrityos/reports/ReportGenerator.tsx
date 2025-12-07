import { useState, useRef } from 'react';
import { FileText, Download, Eye, Filter, Calendar, TrendingUp, AlertTriangle, CheckCircle, Printer, Mail } from 'lucide-react';

export function ReportGenerator() {
  const [reportType, setReportType] = useState('defect-summary');
  const [pipeline, setPipeline] = useState('all');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');
  const [method, setMethod] = useState('all');
  const [showPreview, setShowPreview] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const reportTypes = [
    { id: 'defect-summary', label: 'Сводка по дефектам', icon: AlertTriangle },
    { id: 'pipeline-health', label: 'Состояние трубопроводов', icon: TrendingUp },
    { id: 'inspection-log', label: 'Журнал инспекций', icon: CheckCircle },
    { id: 'risk-assessment', label: 'Оценка рисков', icon: AlertTriangle },
    { id: 'ai-insights', label: 'AI-аналитика', icon: TrendingUp },
  ];

  const handleExportPDF = () => {
    // Симуляция экспорта PDF
    alert('Экспорт в PDF выполнен! Файл будет загружен.');
  };

  const handleExportHTML = () => {
    if (!reportRef.current) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${reportTypes.find(t => t.id === reportType)?.label}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #2563eb, #1d4ed8); color: white; padding: 40px; border-radius: 8px; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
    .metric { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
  </style>
</head>
<body>
  ${reportRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    alert('Функция отправки по email будет доступна в следующей версии');
  };

  const currentReport = reportTypes.find(t => t.id === reportType);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Генератор отчетов</h1>
          <p className="text-slate-600">
            Создавайте профессиональные отчеты по данным мониторинга трубопроводов
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Панель фильтров */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-slate-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Параметры отчета
              </h2>

              <div className="space-y-4">
                {/* Тип отчета */}
                <div>
                  <label className="block text-slate-700 mb-2">Тип отчета</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {reportTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Трубопровод */}
                <div>
                  <label className="block text-slate-700 mb-2">Трубопровод</label>
                  <select
                    value={pipeline}
                    onChange={(e) => setPipeline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все трубопроводы</option>
                    <option value="PL-001">Магистральный газопровод А</option>
                    <option value="PL-002">Нефтепровод Б</option>
                    <option value="PL-003">Водопровод С</option>
                  </select>
                </div>

                {/* Период */}
                <div>
                  <label className="block text-slate-700 mb-2">Дата начала</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-2">Дата окончания</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Метод инспекции */}
                <div>
                  <label className="block text-slate-700 mb-2">Метод инспекции</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все методы</option>
                    <option value="ILI">ILI (Внутренняя инспекция)</option>
                    <option value="UT">UT (Ультразвук)</option>
                    <option value="RT">RT (Радиография)</option>
                    <option value="VT">VT (Визуальный)</option>
                  </select>
                </div>

                {/* Действия */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Скрыть просмотр' : 'Показать просмотр'}
                  </button>
                  
                  <button 
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Экспорт в PDF
                  </button>
                  
                  <button 
                    onClick={handleExportHTML}
                    className="w-full px-4 py-2 bg-white-600 rounded-lg text-grey hover:bg-white-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Экспорт в HTML
                  </button>

                

                  
                </div>
              </div>
            </div>
          </div>

          {/* Область просмотра отчета */}
          {showPreview && (
            <div className="lg:col-span-3">
              <div ref={reportRef} className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden print:shadow-none">
                {/* Заголовок отчета */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-white">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {currentReport && <currentReport.icon className="w-10 h-10" />}
                      <div>
                        <h2 className="text-white mb-2">
                          {currentReport?.label}
                        </h2>
                        <p className="text-blue-100">
                          Период: {new Date(dateFrom).toLocaleDateString('ru-RU')} - {new Date(dateTo).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 mb-1">Дата создания</p>
                      <p className="text-white">{new Date().toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                  
                  {/* Ключевые метрики в шапке */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <p className="text-blue-100 mb-1">Всего дефектов</p>
                      <p className="text-white">247</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <p className="text-blue-100 mb-1">Критических</p>
                      <p className="text-white">42</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <p className="text-blue-100 mb-1">Инспекций</p>
                      <p className="text-white">487</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <p className="text-blue-100 mb-1">Устранено</p>
                      <p className="text-white">189</p>
                    </div>
                  </div>
                </div>

                {/* Содержимое отчета */}
                <div className="p-8 space-y-8">
                  {/* Краткое содержание */}
                  <section>
                    <h3 className="text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded"></div>
                      Краткое содержание
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-blue-600">
                      <p className="text-slate-600 mb-4">
                        Настоящий отчет предоставляет комплексный анализ состояния целостности 
                        трубопроводов за период с {new Date(dateFrom).toLocaleDateString('ru-RU')} по{' '}
                        {new Date(dateTo).toLocaleDateString('ru-RU')}. В ходе мониторинга было 
                        проведено 487 инспекций с использованием различных методов неразрушающего контроля.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <p className="text-slate-700">Критические дефекты</p>
                          </div>
                          <p className="text-slate-900 ml-6">42 обнаружено (17%)</p>
                        </div>
                        
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <p className="text-slate-700">Высокой важности</p>
                          </div>
                          <p className="text-slate-900 ml-6">83 обнаружено (34%)</p>
                        </div>
                        
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <p className="text-slate-700">Средней важности</p>
                          </div>
                          <p className="text-slate-900 ml-6">88 обнаружено (36%)</p>
                        </div>
                        
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <p className="text-slate-700">Низкой важности</p>
                          </div>
                          <p className="text-slate-900 ml-6">34 обнаружено (14%)</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Ключевые выводы */}
                  <section>
                    <h3 className="text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded"></div>
                      Ключевые выводы
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-900 mb-1">Внешняя коррозия - основная угроза</p>
                          <p className="text-slate-600">
                            Составляет 36% всех обнаруженных дефектов, требует усиленного мониторинга
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-900 mb-1">Результаты ILI-инспекций</p>
                          <p className="text-slate-600">
                            Выявлено 145 аномалий, требующих дополнительной оценки и возможного ремонта
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-900 mb-1">Трубопровод А - повышенный риск</p>
                          <p className="text-slate-600">
                            Наблюдается тенденция к увеличению рисков за последние 6 месяцев
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-900 mb-1">Точность AI-модели</p>
                          <p className="text-slate-600">
                            Достигнута точность 87% в классификации серьезности дефектов
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Распределение дефектов */}
                  <section>
                    <h3 className="text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded"></div>
                      Детальное распределение дефектов
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left py-3 px-4 text-slate-700">Тип дефекта</th>
                            <th className="text-center py-3 px-4 text-slate-700">Всего</th>
                            <th className="text-center py-3 px-4 text-slate-700">Критич.</th>
                            <th className="text-center py-3 px-4 text-slate-700">Высокие</th>
                            <th className="text-center py-3 px-4 text-slate-700">Средние</th>
                            <th className="text-center py-3 px-4 text-slate-700">Низкие</th>
                            <th className="text-right py-3 px-4 text-slate-700">% от общего</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">Коррозия</td>
                            <td className="text-center py-3 px-4 text-slate-600">89</td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded">12</span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded">28</span>
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600">35</td>
                            <td className="text-center py-3 px-4 text-slate-600">14</td>
                            <td className="text-right py-3 px-4 text-blue-600">36%</td>
                          </tr>
                          <tr className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">Трещины</td>
                            <td className="text-center py-3 px-4 text-slate-600">54</td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded">18</span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded">22</span>
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600">10</td>
                            <td className="text-center py-3 px-4 text-slate-600">4</td>
                            <td className="text-right py-3 px-4 text-blue-600">22%</td>
                          </tr>
                          <tr className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">Утончение стенок</td>
                            <td className="text-center py-3 px-4 text-slate-600">47</td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded">5</span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded">15</span>
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600">20</td>
                            <td className="text-center py-3 px-4 text-slate-600">7</td>
                            <td className="text-right py-3 px-4 text-blue-600">19%</td>
                          </tr>
                          <tr className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">Вмятины</td>
                            <td className="text-center py-3 px-4 text-slate-600">32</td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded">2</span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded">8</span>
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600">15</td>
                            <td className="text-center py-3 px-4 text-slate-600">7</td>
                            <td className="text-right py-3 px-4 text-blue-600">13%</td>
                          </tr>
                          <tr className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">Дефекты сварки</td>
                            <td className="text-center py-3 px-4 text-slate-600">25</td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded">5</span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded">10</span>
                            </td>
                            <td className="text-center py-3 px-4 text-slate-600">8</td>
                            <td className="text-center py-3 px-4 text-slate-600">2</td>
                            <td className="text-right py-3 px-4 text-blue-600">10%</td>
                          </tr>
                          <tr className="border-t-2 border-slate-300 bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">Итого</td>
                            <td className="text-center py-3 px-4 text-slate-900">247</td>
                            <td className="text-center py-3 px-4 text-slate-900">42</td>
                            <td className="text-center py-3 px-4 text-slate-900">83</td>
                            <td className="text-center py-3 px-4 text-slate-900">88</td>
                            <td className="text-center py-3 px-4 text-slate-900">34</td>
                            <td className="text-right py-3 px-4 text-slate-900">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Рекомендации */}
                  <section>
                    <h3 className="text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded"></div>
                      Рекомендации по устранению
                    </h3>
                    <div className="space-y-4">
                      <div className="p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                          <div>
                            <p className="text-slate-900 mb-1">Критический приоритет</p>
                            <p className="text-slate-600">Немедленный ремонт</p>
                          </div>
                        </div>
                        <ul className="space-y-2 ml-9">
                          <li className="text-slate-700">• 42 критических дефекта на трубопроводе А требуют срочного ремонта</li>
                          <li className="text-slate-700">• Рекомендуется остановка участка для проведения работ</li>
                          <li className="text-slate-700">• Срок устранения: в течение 48 часов</li>
                        </ul>
                      </div>

                      <div className="p-6 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                        <div className="flex items-start gap-3 mb-3">
                          <Calendar className="w-6 h-6 text-orange-600 flex-shrink-0" />
                          <div>
                            <p className="text-slate-900 mb-1">Высокий приоритет</p>
                            <p className="text-slate-600">Плановый ремонт</p>
                          </div>
                        </div>
                        <ul className="space-y-2 ml-9">
                          <li className="text-slate-700">• Запланировать дополнительные инспекции для 89 дефектов высокой важности</li>
                          <li className="text-slate-700">• Провести детальную оценку необходимости ремонта</li>
                          <li className="text-slate-700">• Срок устранения: в течение 30 дней</li>
                        </ul>
                      </div>

                      <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start gap-3 mb-3">
                          <Eye className="w-6 h-6 text-blue-600 flex-shrink-0" />
                          <div>
                            <p className="text-slate-900 mb-1">Мониторинг</p>
                            <p className="text-slate-600">Регулярное наблюдение</p>
                          </div>
                        </div>
                        <ul className="space-y-2 ml-9">
                          <li className="text-slate-700">• Продолжить плановый мониторинг 156 дефектов средней важности</li>
                          <li className="text-slate-700">• Повторная инспекция через 6 месяцев</li>
                          <li className="text-slate-700">• Отслеживание динамики развития дефектов</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Подпись */}
                  <section className="border-t border-slate-200 pt-6 mt-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-slate-600 mb-2">Подготовил:</p>
                        <p className="text-slate-900">_______________________</p>
                        <p className="text-slate-600 text-sm mt-1">Ведущий инженер</p>
                      </div>
                      <div>
                        <p className="text-slate-600 mb-2">Утвердил:</p>
                        <p className="text-slate-900">_______________________</p>
                        <p className="text-slate-600 text-sm mt-1">Главный инженер</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <p className="text-slate-600 text-sm">
                        Отчет сгенерирован автоматически системой IntegrityOS<br />
                        Дата и время: {new Date().toLocaleString('ru-RU')}<br />
                        Версия системы: 2.0.1
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
