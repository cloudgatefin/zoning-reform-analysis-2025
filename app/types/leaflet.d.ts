import 'leaflet';

declare module 'leaflet' {
  export function control(options?: { position?: string }): Control;

  function markerClusterGroup(options?: {
    maxClusterRadius?: number;
    disableClusteringAtZoom?: number;
    iconCreateFunction?: (cluster: MarkerCluster) => DivIcon;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    singleMarkerMode?: boolean;
    animate?: boolean;
  }): MarkerClusterGroup;

  interface MarkerCluster extends Marker {
    getChildCount(): number;
    getAllChildMarkers(): Marker[];
  }

  interface MarkerClusterGroup extends FeatureGroup {
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    clearLayers(): this;
    getBounds(): LatLngBounds;
    hasLayer(layer: Layer): boolean;
  }
}

declare module 'leaflet.markercluster';
