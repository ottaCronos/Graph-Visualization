// Search index
let index
let visual

lunr.tokenizer.separator = /[\s\-'’]+/;

function initSearch(chart, nodes) {

    // Keep a reference of the chart
    visual = chart

    // Set popover title
    document.getElementById('modal-search-title').innerHTML = common_translations[language]['menu_search'];

    // Build index
    index = lunr(function() {
        this.ref('id');
        this.field('label');
        this.pipeline.remove(this.stemmer)
        nodes.forEach(function(node) {
            let item = {
                id: node.id,
                label: node.label + '!',
            };
            this.add(item);
        }, this);
    })

    // Listen to keypress and update search results
    document.getElementById('modal-search-input').addEventListener('keyup', updateSearchResults);

    // Listen to click events
    document.getElementById('modal-search-results').addEventListener('click', zoomIntoNode);

    // Open search modal
    if (query !== false && focus !== false) {
        document.getElementById('modal-search-input').value = query;
        updateSearchResults();
        search_modal_open();
    }
}

function updateSearchResults() {
    let input = document.getElementById('modal-search-input');
    let results = document.getElementById('modal-search-results');
    let query = input.value.trim().toLowerCase();
    if (query === '') {
        results.innerHTML = '';
    } else {

        // Search query
        query += ` ${query}*`;
        let items = index.search(query);

        // Make an additional query with a wildcard
        // See: https://github.com/olivernn/lunr.js/issues/370
        // See: https://github.com/olivernn/lunr.js/issues/421
        // let wildcard = index.query(function(q) {
        //     q.term(lunr.tokenizer(query), {
        //         wildcard: lunr.Query.wildcard.TRAILING,
        //         presence: lunr.Query.presence.REQUIRED
        //     })
        // });
        // // Merge the results
        // let found = [];
        // for (item of items) found.push(item.ref);
        // for (item of wildcard) {
        //     if (!found.includes(item.ref)) items.push(item);
        // }

        if (items.length === 0) {
            results.innerHTML = common_translations[language]['search_no_results'] + '.';
        } else {
            let html = '<p>' + items.length + ' ' + common_translations[language]['search_results'] + '.</p>';
            html += '<ul>';
            for (item of items) {
                node = graph.nodes[item.ref];
                html += '<li node-id="' + item.ref + '">';
                html += node.label + ' (' + node.type + ')';
                html += '</li>';
            };
            html += '</ul>';
            results.innerHTML = html;
        }
    }
}

function zoomIntoNode(event) {
    if (event.target && event.target.tagName === 'LI') {
        id = event.target.getAttribute('node-id');
        search_modal.close();
        visual.zoomIntoNode(id);
    }
}