// create global parameters
let map;
let view;


require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/DistanceMeasurement2D",
    "esri/widgets/AreaMeasurement2D",
    "esri/widgets/Home",
    "esri/widgets/BasemapToggle",
    "esri/Graphic",
    "esri/widgets/Expand",
    "esri/core/watchUtils",
    "esri/widgets/Locate",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/LayerList",
    "esri/layers/GraphicsLayer",
    "esri/views/2d/draw/Draw",
    "esri/widgets/Search",
    "esri/widgets/Print"

], function (
    Map,
    MapView,
    DistanceMeasurement2D,
    AreaMeasurement2D,
    Home,
    BasemapToggle,
    Graphic,
    Expand,
    watchUtils,
    Locate,
    FeatureLayer,
    Legend,
    LayerList,
    GraphicsLayer,
    Draw,
    Search,
    Print
) {
    let activeWidget = null;

    //create map instance
    map = new Map({
        basemap: "osm",
    });

    // Create the MapView and reference the Map in the instance
    view = new MapView({
        container: "viewDiv",
        map: map,
        center: [55.8, 59],
        zoom: 7,
        popup: {
            dockOptions: {
                position: 'bottom-center',
            },
        }

    });


    document
        .getElementById("distanceButton")
        .addEventListener("click", function () {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
                setActiveWidget("distance");
            } else {
                setActiveButton(null);
            }
        });

    document
        .getElementById("areaButton")
        .addEventListener("click", function () {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
                setActiveWidget("area");
            } else {
                setActiveButton(null);
            }
        });

    function setActiveWidget(type) {
        switch (type) {
            case "distance":
                activeWidget = new DistanceMeasurement2D({
                    view: view
                });

                // skip the initial 'new measurement' button
                activeWidget.viewModel.newMeasurement();

                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("distanceButton"));
                break;
            case "area":
                activeWidget = new AreaMeasurement2D({
                    view: view
                });

                // skip the initial 'new measurement' button
                activeWidget.viewModel.newMeasurement();

                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("areaButton"));
                break;
            case null:
                if (activeWidget) {
                    view.ui.remove(activeWidget);
                    activeWidget.destroy();
                    activeWidget = null;
                }
                break;
        }
    }

    function setActiveButton(selectedButton) {
        // focus the view to activate keyboard shortcuts for sketching
        view.focus();
        var elements = document.getElementsByClassName("active");
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
        }
        if (selectedButton) {
            selectedButton.classList.add("active");
        }
    }


    //create OverViewMap
    // Create another Map, to be used in the overview "view"
    let overviewMap = new Map({
        basemap: "osm"
    });
    // Create the MapView for overview map
    let mapView = new MapView({
        container: "overviewDiv",
        map: overviewMap,
        constraints: {
            rotationEnabled: false
        }
    });
    // Remove the default widgets
    mapView.ui.components = [];

    mapView.when(function () {
        view.when(function () {
            setup();
        });
    });

    function setup() {
        const extent3Dgraphic = new Graphic({
            geometry: null,
            symbol: {
                type: "simple-fill",
                color: [0, 0, 0, 0.2],
                outline: {
                    width: 0.5,
                    color: "#2e2e2e"
                }
            }
        });
        mapView.graphics.add(extent3Dgraphic);

        watchUtils.init(view, "extent", function (extent) {
            mapView.goTo({
                center: view.center,
                scale:
                    view.scale *
                    3 *
                    Math.max(
                        view.width / mapView.width,
                        view.height / mapView.height
                    )
            });


            extent3Dgraphic.geometry = extent;
        });
    }

    let overViewExpand = new Expand({
        view: view,
        content: overviewDiv,
        expandIconClass: 'esri-icon-overview-arrow-bottom-left',
        expandTooltip: 'Открыть обзорную карту',
        collapseIconClass: 'esri-icon-overview-arrow-top-right',
        collapseTooltip: 'Закрыть обзорную карту',
        expand: true
    });

// Add the expand instance to the ui

    view.ui.add(overViewExpand, "manual");

//    create instance HomeBtn
    let homeBtn = new Home({
        view: view,

    });
    // Add the home button to the top left corner of the view
    view.ui.add(homeBtn, "top-left");


    // Add this action to the popup so it is always available in this view
    let goToFullDesc = {
        title: "Более подробно...",
        id: "gotothis",
        className: "esri-icon-zoom-out-magnifying-glass"
    };
    //create template for popup
    let template = {
        title: "{main}",
        content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "type1",
                label: "Тип объекта культурного наследия",
                visible: true
            }, {
                fieldName: "type2",
                label: "Тип памятника",
                visible: true
            }, {
                fieldName: "meaning",
                label: "Значение памятника",
                visible: true
            }, {
                fieldName: "year",
                label: "Год обнаружения",
                visible: true
            }, {
                fieldName: "objectid",
                label: "Год обнаружения",
                visible: false
            }
            ]
        }],
        dockEnabled: false,
        actions: [goToFullDesc],
    };


    function gotothis() {
        if (view.popup.featureCount == 1) {
            let objId = view.popup.features[0].attributes.objectid;
            window.open(`http://history-map.psu.ru/${objId}`);
        } else {
            let num_of_popup = +document.querySelector('.esri-popup__button.esri-popup__feature-menu-button').innerHTML[0];
            let objId = view.popup.features[num_of_popup - 1].attributes.objectid;
            window.open(`http://history-map.psu.ru/${objId}`);
        }

    }

    view.popup.on("trigger-action", function (event) {
        // Execute the gotothis() function if the measure-this action is clicked
        if (event.action.id === "gotothis") {
            gotothis();
        }
    });
    // create layers of "Все памятники"
    const layerObjects = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/5",
        popupTemplate: template,
        visible: false
    });
    // create layers of "Памятники истории"
    const layer1 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/1",
        title: 'Памятники истории',
        outFields: ['*'],
        popupTemplate: template,
    });
    //create layer Археологические памятники
    const layer2 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/2",
        title: 'Археологические памятники',
        outFields: ['*'],
        popupTemplate: template,
    });
    //create layer Памятники архитектуры
    const layer3 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/3",
        title: 'Памятники архитектуры',
        outFields: ['*'],
        popupTemplate: template,
    });
    //create layer Ансамбли
    const layer4 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/4",
        title: 'Ансамбли',
        outFields: ['*'],
        popupTemplate: template,
    });
    //create layer Волоки
    const layer8 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/8",
        title: 'Волоки',
        visible: false

    });
    //create layer Волоковые реки (линии)
    const layer9 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/9",
        title: 'Волоковые реки (линии)',
        visible: false

    });
    //create layer Волоковые реки (полигоны)
    const layer10 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/10",
        title: 'Волоковые реки (полигоны)',
        visible: false
    });

    //create layer Граница Пермского края
    const layer11 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/12",
        title: 'Граница Пермского края',
        visible: false
    });
    //create layer Границы муниципальных районов и округов
    const layer12 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/13",
        title: 'Границы муниципальных районов и округов',
        visible: false
    });
    //create layer Границы городских и сельских поселений
    const layer13 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/14",
        title: 'Границы городских и сельских поселений',
        visible: false
    });
    //create layer Населенные пункты по ВВП
    const layer14 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/6",
        title: 'Населенные пункты',
    });

    // create layer Области распространения карста
    const layer15 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/15",
        title: 'Карст',
        visible: false

    });
    //create layer Инженерно-геологические формации коренных пород
    const layer16 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/16",
        title: 'Инженерно-геологические формации коренных пород',
        visible: false
    });
    // create layer Почвенная карта
    const layer17 = new FeatureLayer({
        // URL to the service
        url: "http://maps.psu.ru:8080/arcgis/rest/services/history/history/MapServer/17",
        title: 'Почвенная карта',
        visible: false
    });
    // it is order for proper display layers
    //geology, soils,karst
    map.add(layer15);
    map.add(layer16);
    map.add(layer17);
    //admin
    map.add(layer11);
    map.add(layer12);
    map.add(layer13);
    map.add(layer14);
    //volok
    map.add(layer8);
    map.add(layer9);
    map.add(layer10);
    //objects
    map.add(layer1);
    map.add(layer2);
    map.add(layer3);
    map.add(layer4);


    //create legend
    let legend = new Legend({
        view: view,
        layerInfos: [{
            layer: layer1,
            title: "Памятники истории"
        },
            {
                layer: layer2,
                title: "Археологические памятники"
            },
            {
                layer: layer3,
                title: "Памятники архитектуры"
            },
            {
                layer: layer4,
                title: "Ансамбли"
            },
            {
                layer: layer8,
                title: "Волоки"
            },
            {
                layer: layer9,
                title: "Волоковые реки (линии)"
            },
            {
                layer: layer10,
                title: "Волоковые реки (полигоны)"
            },
            {
                layer: layer11,
                title: "Граница Пермского края"
            },
            {
                layer: layer12,
                title: "Границы муниципальных районов и округов"
            },
            {
                layer: layer13,
                title: "Границы городских и сельских поселений"
            },
            {
                layer: layer14,
                title: "Населенные пункты по ВВП"
            },
            {
                layer: layer15,
                title: "Области распространения карста"
            },
            {
                layer: layer16,
                title: "Инженерно-геологические формации коренных пород"
            },
            {
                layer: layer17,
                title: "Почвенная карта"
            },
        ]
    });
    view.ui.add(legend, "manual");
    //create layerList
    let layerList = new LayerList({
        view: view
    });
    // Add widget
    view.ui.add(layerList, {
        position: "manual"
    });
    //create  locate widget instance
    let locateBtn = new Locate({
        view: view
    });

    // Add the locate widget to the top left corner of the view
    view.ui.add(locateBtn, {
        position: "manual"
    });
//add btn for draw polygon
    view.ui.add("line-button", "manual");
    const draw = new Draw({
        view: view
    });


    var resultsLayer = new GraphicsLayer({
        listMode: "hide",
    });
    map.add(resultsLayer);
    document.getElementById("line-button").onclick = function () {
        document.getElementById("clearGraph").setAttribute("style", "display: block");
        document.querySelector(".map__info-objects").setAttribute("style", "display: block");
        view.graphics.removeAll();
        // creates and returns an instance of PolygonDrawAction
        const action = draw.create("polygon");

        // listen polylineDrawAction events to give immediate visual feedback
        // to users as the line is being drawn on the view.
        action.on(["vertex-add", "vertex-remove", "cursor-update", "redo", "undo", "draw-complete"
        ], updateVertices);
    };

    function updateVertices(event) {
        // create a polygon from returned vertices
        const result = createGraphic(event);
    }

    function createGraphic(event) {
        const vertices = event.vertices;
        view.graphics.removeAll();
        // a graphic representing the polygon that is being drawn
        var graphic = new Graphic({
            geometry: {
                type: "polygon",
                rings: vertices,
                spatialReference: view.spatialReference
            },
            symbol: {
                type: "simple-fill",
                style: "solid",
                outline: {
                    color: "red",
                    width: 1
                }
            }
        });
        view.graphics.add(graphic);
        if (event.type == "draw-complete") {
            QueryObjects(graphic);
        }
    }

    //this arrays need for counting of type;
    let typesObjects = [
        'поселение',
        'городище',
        "могильник",
        "селище",
        "стоянка",
        "местонахождение",
        "пещера",
        "грот",
        "стоянка-селище",
        "поселение-могильник",
        "городище-костище",
        "завод",
        "святилище",
        "костище",
        "селище-могильник",
        "памятник истории",
        'памятник',
        "гражданская архитектура",
        "промышленная архитектура",
        "церковная архитектура",
        "место битвы",
        "писанцы",
        "поселение и завод"];


    let displayOfResult = document.querySelector('.map__info-objects');

    function QueryObjects(graphic) {
        let query = layerObjects.createQuery();
        let countObjects = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        query.geometry = graphic.geometry;
        query.spatialRelationship = "intersects";
        query.returnGeometry = true;
        layerObjects.queryFeatures(query).then(function (results) {
            results.features.forEach(function (item) {
                typesObjects.forEach(function (current, ind) {
                    if (current == item.attributes.type2) {
                        countObjects[ind]++;
                    }
                });


            });
            countObjects.forEach(function (curr, index) {
                if (curr > 0) {
                    let p = document.createElement('p');
                    p.innerHTML = `${typesObjects[index]}: ${countObjects[index]} `;
                    displayOfResult.append(p);
                }
            });
            let p = document.createElement('p');
            p.innerHTML = `Всего:${results.features.length} `;
            displayOfResult.append(p);
            displayResults(results);
        });

    }

    function displayResults(results) {

        resultsLayer.removeAll();
        let features = results.features.map(function (graphicQrObjects) {
            graphicQrObjects.symbol = {
                type: "simple-marker",
                style: "diamond",
                size: 11,
                color: "green"
            };
            return graphicQrObjects;
        });
        resultsLayer.addMany(features);
    }

    document.getElementById("clearGraph").addEventListener("click", function () {
        view.graphics.removeAll();
        resultsLayer.removeAll();
        document.querySelector(".map__info-objects").innerHTML = " ";
        document.querySelector(".map__info-objects").setAttribute("style", "display: none");
        document.getElementById("clearGraph").setAttribute("style", "display: none");
    });


//    create instance of  Search widget
    let searchWidget = new Search({
        view: view,
        allPlaceholder: "Название памятника",
        label: 'Поисковый виджет',
        includeDefaultSources: false,
        locationEnabled: false,
        popupEnabled: false,
        sources: [
            {
                layer: layerObjects,
                searchFields: ["main"],
                displayField: "main",
                zoomScale: 1,
                exactMatch: false,
                placeholder: 'Название памятника',
                outFields: ["*"],
                name: "Релевантные объекты",
                resultSymbol: {
                    type: "simple-marker", // autocasts as new PictureMarkerSymbol()
                    height: 60,
                    width: 60,
                    color: [150, 150, 150],
                    outline: {
                        color: [255, 0, 0],
                        width: 2
                    }
                }
            },

        ]
    });

    // Add the search widget to the top left corner of the view
    view.ui.add(searchWidget, {
        position: "manual"
    });
    //create instance of PrintWidget
    let print = new Print({
        view: view,
        container: document.createElement("div"),
        //use service of ESRI for create image for print
        printServiceUrl:
            "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
    });


    let PrintWidgetExpand = new Expand({
        view: view,
        content: print,
        expandTooltip: 'Открыть виджет для печати',
        collapseTooltip: 'Закрыть виджет для печати',
        id: 'printId'

    });

// Add the expand instance to the ui

    view.ui.add(PrintWidgetExpand, "manual");


// create custom widget of coords
    let coordsWidget = document.createElement("div");
    coordsWidget.id = "coordsWidget";
    coordsWidget.className = "esri-widget esri-component map__position-info";
// Add the coordsWidget to the bottom left corner of the view
    view.ui.add(coordsWidget, "bottom-left");

    function showCoordinates(pt) {
        //define variables
        let longitude = pt.longitude.toFixed(3);
        let latitude = pt.latitude.toFixed(3);
        let scale = Math.round(view.scale * 1);
        // add whitespace for improve view
        let scale_whitespace = scale.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        //add variables into div
        coordsWidget.innerHTML = `<p>Широта/Долгота: ${latitude} / ${longitude} </p><p> Масштаб 1:${scale_whitespace} </p>`
    }

//set initial coords
    view.watch("stationary", function (isStationary) {
        showCoordinates(view.center);
    });
//update coords when pointer move
    view.on("pointer-move", function (evt) {
        showCoordinates(view.toMap({x: evt.x, y: evt.y}));
    });

// create instance BasemapToggle
    let basemapToggle = new BasemapToggle({
        // 2 - Set properties
        view: view, // view that provides access to the map's 'osm' basemap
        nextBasemap: "satellite" // allows for toggling to the 'satellite' basemap
    });

// Add widget to the top right corner of the view
    view.ui.add(basemapToggle, "bottom-right");

});


// scripts for customize map
let layerListBtn = document.querySelector('.esri-layer-list-toggle');
let legendBtn = document.querySelector('.esri-legend-toggle');
layerListBtn.addEventListener('click', function () {
    if (layerListBtn.textContent == 'Показать список слоёв') {
        layerListBtn.textContent = 'Скрыть список слоёв';
    } else {
        layerListBtn.textContent = 'Показать список слоёв';
    }
    document.querySelector('.esri-layer-list').classList.toggle('esri-layer-list_open');
});

legendBtn.addEventListener('click', function () {

    if (legendBtn.textContent == 'Показать легенду') {
        legendBtn.textContent = 'Скрыть Легенду';
    } else {
        legendBtn.textContent = 'Показать легенду';
    }
    document.querySelector('.esri-legend').classList.toggle('esri-legend_open');

});

