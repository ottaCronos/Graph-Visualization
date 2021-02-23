//////////////////////////////////////////////////////////////
////////////////////////// URL params ////////////////////////
//////////////////////////////////////////////////////////////

// Get URL params
let params = new URLSearchParams(window.location.search)

// Set to true to redo the constellation simulation
let simulation = params.get('simulation') === null ? false : true

// Language
let language = ['en', 'fr', 'es'].indexOf(params.get('language')) === -1 ? 'en' : params.get('language')

// Search query
let query = params.get('query') === null ? false : params.get('query')
if (query && !query.match(/^[A-Za-z]+$/)) query = false

// Filter nodes
let filter = params.get('filter') === null ? false : params.get('filter').split(',')
if (filter) filter = filter.map(i => isNaN(i) ? i : 'element_' + i);

// Focus
let focus = params.get('focus') === null ? false : params.get('focus')
if (focus && !focus.match(/^(element|sdg|publication|casestudy)_[0-9]+$/)) focus = false

//Random navigation animation
let animate = params.get('animate') === null ? false : params.get('animate')
if (animate) animate = animate.split(",")
if (animate[0] === "true") animate = true

// Hide menu items
let hide = params.get('hide') === null ? [] : params.get('hide').split(',')

//////////////////////////////////////////////////////////////
///////////////////////// Intro setup ////////////////////////
//////////////////////////////////////////////////////////////

document.getElementById('intro-welcome').innerHTML = translations[language]['intro_welcome'];
document.getElementById('intro-unesco').innerHTML = translations[language]['intro_unesco'];
document.getElementById('intro-title').innerHTML = translations[language]['intro_title'];
document.getElementById('intro-subtext').innerHTML = translations[language]['intro_subtext'];
document.getElementById('intro-info').innerHTML = translations[language]['intro_info'];

//////////////////////////////////////////////////////////////
///////////////////////// Menu setup /////////////////////////
//////////////////////////////////////////////////////////////

// Translate
//document.getElementById('menu-search').innerHTML = common_translations[language]['menu_search'];
document.getElementById('menu-intro').innerHTML = common_translations[language]['menu_intro'];
//document.getElementById('menu-legend').innerHTML = common_translations[language]['menu_legend'];
document.querySelectorAll('#menu-about a')[0].innerHTML = common_translations[language]['menu_about'];
document.querySelectorAll('#menu-about a')[0].setAttribute('href', common_translations[language]['menu_about_link'])
let menu_more = document.getElementById('menu-more');
menu_more.innerHTML = common_translations[language]['menu_more'] + menu_more.innerHTML;
let menu_share = document.getElementById('menu-share');
menu_share.innerHTML = common_translations[language]['menu_share'] + menu_share.innerHTML;
document.querySelectorAll('#menu-more-constellation a')[0].innerHTML = common_translations[language]['menu_more_constellation'];
document.querySelectorAll('#menu-more-biome a')[0].innerHTML = common_translations[language]['menu_more_biome'];
document.querySelectorAll('#menu-more-domain a')[0].innerHTML = common_translations[language]['menu_more_domain'];
document.querySelectorAll('#menu-more-threat a')[0].innerHTML = common_translations[language]['menu_more_threat'];
document.querySelectorAll('#menu-more-sdg a')[0].innerHTML = common_translations[language]['menu_more_sdg'];
document.querySelectorAll('#menu-more a').forEach(e => e.setAttribute('href', e.getAttribute('href') + '?language=' + language));
let menu_language = document.getElementById('menu-language');
menu_language.innerHTML = common_translations[language]['menu_language'] + menu_language.innerHTML;

// Share
let share_url = window.location.protocol + '//' + window.location.host + window.location.pathname;
let share_buttons = document.querySelectorAll('.st-custom-button');
for (let button of share_buttons) {
    button.setAttribute('data-url', share_url)
}

// Hide custom
hide.push('more-constellation', 'language-' + language);
hide = [...new Set(hide)]; // unique values
for (let item of hide) {
    let e = document.getElementById('menu-' + item);
    if (e) e.setAttribute('style', 'display: none;');
}
if (hide.includes('nav')) document.getElementById('navigation').style.display = 'none'; // Remove the entire navigation

//////////////////////////////////////////////////////////////
//////////////////////// Legend setup ////////////////////////
//////////////////////////////////////////////////////////////

document.getElementById('modal-legend-img').setAttribute('src', 'img/Legend-Constellation_' + language + '.png');

//////////////////////////////////////////////////////////////
////////////////////// Switch language ///////////////////////
//////////////////////////////////////////////////////////////

function switch_language() {
    let l = this.getAttribute('id').substr(-2);
    window.location.href = window.location.pathname + '?language=' + l;
}

document.querySelectorAll('#menu-language li').forEach(e => e.addEventListener('click', switch_language));

//////////////////////////////////////////////////////////////
///////////////////////// Modal setup ////////////////////////
//////////////////////////////////////////////////////////////

// From https://github.com/benceg/vanilla-modal

// Intro modal
let intro_modal = new VanillaModal.default({
    onBeforeOpen: function() {
        // Add intro class
        document.getElementById('container-modal').classList.add('modal-intro');
    },
    onClose: function() {
        // Remove intro class
        document.getElementById('container-modal').classList.remove('modal-intro');
        // Show navigation
        document.getElementById('navigation').style.display = '';
        // Show legend
        if (show_legend_modal) {
            show_legend_modal = false;
            legend_modal.open('#legend-modal');
        }
    }
});

// If no query, filter or simulation is done, start with the intro modal
let intro_modal_open = function() {
    document.getElementById('navigation').style.display = 'none';
    intro_modal.open('#intro-modal');
    document.cookie = 'dive_constellation_show_intro=false';
}
let show_intro_modal = true
if (query !== false || filter !== false || focus !== false || animate !== false || simulation !== false) show_intro_modal = false;
if (document.cookie.includes('dive_constellation_show_intro=false')) show_intro_modal = false;
if (show_intro_modal === true) intro_modal_open();
document.getElementById('menu-intro').addEventListener('click', intro_modal_open);

// ICH element info modal
let node_modal = new VanillaModal.default()
node_modal_init_scroll();

// Search modal
let search_modal = new VanillaModal.default({
    onBeforeOpen: function() {
        // Add search class
        document.getElementById('container-modal').classList.add('modal-search');
    },
    onClose: function() {
        // Remove search class
        document.getElementById('container-modal').classList.remove('modal-search');
    }
});
let search_modal_open = function() {
    search_modal.open('#search-modal');
    document.getElementById('modal-search-input').focus();
}
document.getElementById('menu-search').addEventListener('click', search_modal_open);

// Legend Modal
let show_legend_modal = false;
let legend_modal = new VanillaModal.default({
    onBeforeOpen: function() {
        document.querySelectorAll('.modal-content')[0].setAttribute('style', 'max-width: 1400px;');
    },
    onClose: function() {
        document.querySelectorAll('.modal-content')[0].removeAttribute('style');
    }
})
let legend_modal_open = function() {
    if (document.querySelector('.modal-intro') !== null) {
        show_legend_modal = true;
        intro_modal.close();
    } else {
        legend_modal.open('#legend-modal');
    }
}
document.getElementById('menu-legend').addEventListener('click', legend_modal_open);
document.getElementById('intro-legend').addEventListener('click', legend_modal_open);

//////////////////////////////////////////////////////////////
///////////////////////// Chart setup ////////////////////////
//////////////////////////////////////////////////////////////

//Div that will hold the chart
let container = d3.select("#chart")

//Set-up the chart - it's not drawn yet
let w = document.documentElement.clientWidth
let h = document.documentElement.clientHeight
let constellationVisual = createConstellationVisual()
    .width(w)
    .height(h)
    .language(language)
    .showTooltip(createTooltip)
    .hideTooltip(removeTooltip)
    .showModal(createModal)
    .closeModal(closeModal)
    .modalTypes(["element"])

//////////////////////////////////////////////////////////////
/////////////// Read in the data - Draw the chart ////////////
//////////////////////////////////////////////////////////////

//Make sure the fonts are loaded that are in the visual
let font1 = new FontFaceObserver("Oswald", { weight: 300 })

let promises = []
promises.push(d3.json("/dive/data/graph_" + language + ".json"))
//Use this when you have a node-locations.json file and don't need to redo the simulation
if(!simulation) promises.push(d3.json("/dive/data/constellation-node-locations.json"))
promises.push(font1.load())

// Expose the graph object
let data;

Promise.all(promises).then(values => {
    graph = values[0]
    data = JSON.parse(JSON.stringify(graph)) // Inefficient but easy deep copy
    let nodes = prepareNodes(graph)
    let edges =  prepareEdges(graph)

    //Link the locations to the nodes in the graph
    if(!simulation) {
        let locations = values[1]
        let location_id_map = {}
        locations.forEach(l => location_id_map[l.id] = l)
        nodes.forEach(d => {
            let node = location_id_map[d.id]
            if(node) {
                d.x = node.x_fixed
                d.y = node.y_fixed
                d.degree = node.degree
                if(node.community > -1) d.community = node.community
            }//if
        })//forEach
    }//if

    //Set up the basis of the chart - initial containers are drawn
    container.call(constellationVisual, nodes, edges)

    //Draw the charts
    if(simulation) constellationVisual.initializeSimulation()
    else constellationVisual.createChart(getFilteredData)
})//promise

//////////////////////////////////////////////////////////////
////////////////////////// When ready ////////////////////////
//////////////////////////////////////////////////////////////

function getFilteredData(nodes) {
    initSearch(constellationVisual, nodes)
    initFilter()
    initFocus(constellationVisual)
    initRandomNavigation(constellationVisual)
    initCSVDownload()
}//function getFilteredData

//////////////////////////////////////////////////////////////
////////////////////////// Fix nodes /////////////////////////
//////////////////////////////////////////////////////////////

function initFilter() {
    if (query === false && focus === false && animate === false && filter !== false) {
       constellationVisual.fixMultiNodes(filter)
    }
}//function initFilter

//////////////////////////////////////////////////////////////
//////////////////////// Focus on node ///////////////////////
//////////////////////////////////////////////////////////////

function initFocus(chart) {
    if (query === false && filter === false && animate === false && focus !== false) {
        chart.zoomIntoNode(focus);
    }
}//function initFocus

//////////////////////////////////////////////////////////////
/////////// Start random navigation from the start ///////////
//////////////////////////////////////////////////////////////

function initRandomNavigation(chart) {
    if (query === false && filter === false  && focus === false && animate !== false) {
        animationStart();
        //chart.randomNavigation(animate, true); // Allow pause
    }
}//function initRandomNavigation

//////////////////////////////////////////////////////////////
////////////// Start random navigation on click //////////////
//////////////////////////////////////////////////////////////

let animationButton = document.getElementById('menu-animate');
let animationActive = false;

function onAnimationStart() {
    animationActive = true;
    animationButton.firstChild.setAttribute('class', 'fas fa-stop');
}

function onAnimationStop() {
    animationActive = false;
    animationButton.firstChild.setAttribute('class', 'fas fa-play');
}

function animationStart() {
    onAnimationStart();
    constellationVisual.randomNavigation(animate, false, onAnimationStop);
}

function animationStop() {
    constellationVisual.stopRandomNavigation();
    onAnimationStop();
}

animationButton.onclick = () => {
    if (animationActive) {
        animationStop();
    } else {
        animationStart();
    }
}

//////////////////////////////////////////////////////////////
//////////////////////// CSV Download ////////////////////////
//////////////////////////////////////////////////////////////

function initCSVDownload() {
    document.getElementById('menu-csv').onclick = () => {
        let link = document.getElementById('download');
        if (link == null) {
            // Generate array
            let rows = [];
            let relations = get_relations(
                ['vocabulary_ich', 'vocabulary_thesaurus', 'country'],
                'element'
            );
            let header = [
                'id',
                'label',
                'year',
                'list',
                'link',
                'countries',
                'primary_concepts',
                'secondary_concepts'
            ];
            rows.push(header);
            for (element_id in relations) {
                let row = [
                    element_id,
                    relations[element_id]['src']['label'],
                    relations[element_id]['src']['meta']['year'],
                    relations[element_id]['src']['meta']['list'],
                    relations[element_id]['src']['meta']['link']
                ];
                let countries = [];
                for (country_id in relations[element_id]['dst']['country']) {
                    country = relations[element_id]['dst']['country'][country_id];
                    countries.push(country['label']);
                }
                row.push(countries.sort().join(', '));
                let concepts = [[], []];
                for (concept_id in relations[element_id]['dst']['vocabulary_thesaurus']) {
                    concept = relations[element_id]['dst']['vocabulary_thesaurus'][concept_id];
                    concepts[concept['weight'] - 2].push(concept['label']);
                }
                for (concept_id in relations[element_id]['dst']['vocabulary_ich']) {
                    concept = relations[element_id]['dst']['vocabulary_ich'][concept_id];
                    concepts[concept['weight'] - 2].push(concept['label']);
                }
                row.push(concepts[1].sort().join('; '));
                row.push(concepts[0].sort().join('; '));
                rows.push(row);
            }
            // Convert to CSV
            let csv = 'data:text/csv;charset=utf-8,\ufeff' // BOM for MS Excel
                + rows.map(d => JSON.stringify(d))
                .join('\n')
                .replace(/(^\[)|(\]$)/mg, '');
            // Create hidden link
            link = document.createElement('a');
            link.setAttribute('id', 'download');
            link.setAttribute('href', encodeURI(csv));
            link.setAttribute('download', 'elements.csv');
            document.body.appendChild(link);
        }
        // Download
        link.click();
    }
}

//////////////////////////////////////////////////////////////
////////////////////// Page resize actions ///////////////////
//////////////////////////////////////////////////////////////

let current_width = window.innerWidth
let current_height = window.innerHeight
let resizeTimer = null
window.addEventListener("resize", function () {
    //Reset timer
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        //Only resize if the width is changed, or if the height is changed for a landscape orientation
        //Otherwise you get odd behavior on (portrait) mobile due to URL bar appearing and disappearing
        if(window.innerWidth !== current_width || (window.innerHeight !== current_height && window.innerHeight < window.innerWidth)) {
            current_width = window.innerWidth
            current_height = window.innerHeight
            w = document.documentElement.clientWidth
            h = document.documentElement.clientHeight
            constellationVisual
                .width(w)
                .height(h)
                .resize()
        }//if
    }, 300)
})//on resize

//////////////////////////////////////////////////////////////
//////////// Functions for simple mouseover tooltip //////////
//////////////////////////////////////////////////////////////

//Initialize the function for showing the tooltip on hover
//This tooltip function will be run when the user hovers over a node
//And when a click is active, it will also run when hovered over a visible edge
//You can distinguish between the two, because obj.type will be "edge" for the edge hover
function createTooltip(obj) {
    let radius, label, type, note
    if(obj.type === "edge") {
        radius = 0
        label = obj.node.label
        note = typeConversion(obj.node.type) + " connected to this line"
        d3.select("#chart-tooltip")
            .style("border", "2px solid " + obj.node.fill)
            .style("box-shadow", "none")
    } else { //node
        radius = obj.r
        label = obj.label
        note = typeConversion(obj.type)
        d3.select("#chart-tooltip")
            .style("border", null)
            .style("box-shadow", null)
    }//else

    //Change titles
    d3.select("#chart-tooltip .tooltip-type").html(note)
    d3.select("#chart-tooltip .tooltip-title").html(label)
    let box_size = document.getElementById("chart-tooltip").getBoundingClientRect()

    //Place & show the tooltip
    d3.select("#chart-tooltip")
        .style("top", (obj.y + h/2 - box_size.height - radius - Math.max( radius * 0.2, 30 )) + "px")
        .style("left", (obj.x + w/2 - box_size.width/2) + "px")
        .style("opacity", 1)
}//function createTooltip

function removeTooltip() {
    //Hide the tooltip
    d3.select("#chart-tooltip").style("opacity", 0)
}//function removeTooltip

//////////////////////////////////////////////////////////////
////////// Functions to prepare the node & edge data /////////
//////////////////////////////////////////////////////////////

function prepareNodes(graph) {
    let nodes = []
    //Place all nodes in array instead, since that's what d3's force wants
    for(let element in graph.nodes) {
        graph.nodes[element].id = element
        nodes.push(graph.nodes[element])
    }//for i
    return nodes
}//function prepareNodes

function prepareEdges(graph) {
    let edges = graph.edges
    //Rename since d3's force needs a "source-target" pair
    edges.forEach(d => {
        d.source = d.subject
        d.target = d.object
        delete d.subject
        delete d.object
    })
    return edges
}//function prepareEdges