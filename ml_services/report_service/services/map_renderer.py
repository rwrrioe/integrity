import matplotlib.pyplot as plt
import io
import contextily as ctx
import geopandas as gpd
from shapely.geometry import Point, LineString

class MapRenderer:
    def __init__(self):
        # Выбираем стиль карты. 
        # CartoDB.Positron - светлая, минималистичная, идеальна для отчетов.
        # OpenStreetMap.Mapnik - цветная, детальная.
        self.map_provider = ctx.providers.CartoDB.Positron

    def generate_pipeline_map(self, defects):
        """
        Генерирует карту всего участка с привязкой к местности.
        """
        if not defects:
            return self._create_empty_image()

        # 1. Готовим данные
        lats = [d.lat for d in defects]
        lons = [d.lon for d in defects]
        severities = [d.severity for d in defects]

        # Создаем точки
        geometry = [Point(lon, lat) for lon, lat in zip(lons, lats)]
        gdf = gpd.GeoDataFrame({'severity': severities}, geometry=geometry)
        
        # Устанавливаем исходную систему координат (WGS84 - GPS)
        gdf.set_crs(epsg=4326, inplace=True)
        
        # Конвертируем в Web Mercator (для подложки карты)
        gdf = gdf.to_crs(epsg=3857)

        # 2. Настройка графика
        fig, ax = plt.subplots(figsize=(10, 6), dpi=100)

        # 3. Рисуем линию трубопровода (соединяем точки для визуализации маршрута)
        # Если точки разбросаны хаотично, этот блок можно убрать
        if len(gdf) > 1:
            # Создаем линию из точек
            line_geo = LineString(gdf.geometry.tolist())
            gdf_line = gpd.GeoDataFrame(geometry=[line_geo], crs="EPSG:3857")
            gdf_line.plot(ax=ax, color='blue', linewidth=2, alpha=0.5, zorder=1)

        # 4. Рисуем точки дефектов разными цветами
        # Разделяем по критичности для цветов
        critical = gdf[gdf['severity'].isin(['Critical', 'High'])]
        medium = gdf[gdf['severity'] == 'Medium']
        low = gdf[~gdf['severity'].isin(['Critical', 'High', 'Medium'])]

        if not critical.empty:
            critical.plot(ax=ax, color='#d32f2f', markersize=100, edgecolors='white', zorder=3, label='Critical')
        if not medium.empty:
            medium.plot(ax=ax, color='#f57c00', markersize=60, edgecolors='white', zorder=2, label='Medium')
        if not low.empty:
            low.plot(ax=ax, color='#388e3c', markersize=40, edgecolors='white', zorder=2, label='Low/Resolved')

        # 5. Добавляем подложку карты (САМОЕ ВАЖНОЕ)
        # zoom=auto автоматически подберет детализацию
        try:
            ctx.add_basemap(ax, source=self.map_provider, crs=gdf.crs.to_string())
        except Exception as e:
            print(f"Error loading map tiles: {e}")
            # Если нет интернета, отрисуется просто белый фон с точками

        # Убираем оси координат (числа не нужны на красивой карте)
        ax.set_axis_off()
        plt.title("Pipeline Route & Defects", fontsize=14)
        
        # Легенда
        plt.legend(loc='upper right')

        # 6. Сохраняем в байты
        return self._save_to_buffer()

    def generate_single_defect_map(self, lat, lon, defect_type):
        """
        Зум на конкретную точку на карте.
        """
        # 1. Создаем точку
        gdf = gpd.GeoDataFrame(geometry=[Point(lon, lat)])
        gdf.set_crs(epsg=4326, inplace=True)
        gdf = gdf.to_crs(epsg=3857)

        fig, ax = plt.subplots(figsize=(6, 4), dpi=100)

        # 2. Рисуем точку
        gdf.plot(ax=ax, color='red', markersize=200, marker='X', zorder=5)

        # 3. Добавляем карту
        # Чтобы сделать Zoom, нам нужно ограничить область видимости
        # Мы берем координаты точки в меркаторе и отступаем от нее (буфер)
        
        # 500 метров вокруг точки (в проекции 3857 единицы - это метры)
        buffer_dist = 500 
        minx, miny, maxx, maxy = gdf.geometry.buffer(buffer_dist).total_bounds
        ax.set_xlim(minx, maxx)
        ax.set_ylim(miny, maxy)

        try:
            # zoom=15 - уровень зума как на улицах
            ctx.add_basemap(ax, source=self.map_provider, crs=gdf.crs.to_string(), zoom=15)
        except Exception as e:
            print(f"Error loading tiles: {e}")

        ax.set_axis_off()
        plt.title(f"Location: {defect_type}", fontsize=10)
        
        # Добавляем подпись координат текстом внизу
        plt.figtext(0.5, 0.01, f"Lat: {lat:.5f}, Lon: {lon:.5f}", ha="center", fontsize=8, color="gray")

        return self._save_to_buffer()

    def _save_to_buffer(self):
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
        plt.close()
        buf.seek(0)
        return buf.read()
        
    def _create_empty_image(self):
        fig, ax = plt.subplots(figsize=(5, 2))
        ax.text(0.5, 0.5, "No geolocation data available", ha='center', va='center')
        ax.axis('off')
        return self._save_to_buffer()