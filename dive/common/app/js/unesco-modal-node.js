//////////////////////////////////////////////////////////////
///////////// Functions for ICH nodes click modal ////////////
//////////////////////////////////////////////////////////////

//Initialize the function for showing the modal on node's 2nd click on hover
function createModal(obj) {

    // Clear
    let containers = [
        'chart-modal-full-img',
        'modal-node-year',
        'modal-node-type',
        'modal-node-countries',
        'modal-node-title',
        'modal-node-watch',
        'modal-node-description',
        'modal-node-link',
        'modal-node-keywords',
        'modal-node-sustainability',
        'modal-node-considerations',
        'modal-node-header',
        'modal-node-lists',
        'chart-modal-img-slider',
        'navigate',
        'permalink'
    ];
    for (container of containers) {
        let e = document.getElementById(container);
        if (e != null) {
            e.innerHTML = '';
            e.style.display = 'none';
        }
    }

    // Main photo
    if (obj.meta && obj.meta.icon && obj.meta.icon.large !== '') {
        let e = document.getElementById('chart-modal-full-img');
        e.style.display = '';
        e.style.backgroundImage = `url("${obj.meta.icon.large}")`;
    }

    // Header SDG
    if (obj.type == 'sdg') {
        e_header = document.getElementById('modal-node-header');
        // Icon
        let icon = '<img src="icons/color/' + language + '/' + obj.id + '.png">';
        e_icon = document.createElement('img');
        e_icon.setAttribute('id', 'modal-node-header-icon');
        e_icon.setAttribute('src', 'icons/color/' + language + '/' + obj.id + '.png');
        e_icon.innerHTML = icon;
        e_header.appendChild(e_icon);
        // Wrapper
        e_wrapper = document.createElement('div');
        e_wrapper.setAttribute('id', 'modal-node-header-wrapper');
        // Title
        e_title = document.createElement('span');
        e_title.setAttribute('id', 'modal-node-header-title');
        e_title.innerHTML = obj.meta.description;
        e_wrapper.appendChild(e_title);
        // Link
        if (!window.location.href.includes('sdg-single')) {
            let e_link = document.createElement('a');
            e_link.setAttribute('id', 'modal-node-header-link');
            e_link.setAttribute('href', '../sdg-single/?sdg-index=' + obj.id.split('_').slice(-1).pop() + '&language=' + language);
            e_link.innerHTML = common_translations[language]['sdg_more'];
            e_wrapper.appendChild(e_link);
        }
        e_header.appendChild(e_wrapper);
        e_header.style.display = '';
    }

    // Title
    if (obj.label && obj.type != 'sdg') {
        let e = document.getElementById('modal-node-title');
        e.innerHTML = obj.label;
        e.style.display = '';
    }

    // Subtitles Element
    if (obj.type == 'element') {
        // List
        e = document.getElementById('modal-node-type');
        e.innerHTML = (obj.meta && obj.meta.list) ? common_translations[language][obj.meta.list.toLowerCase()] : typeConversion(obj.type);
        e.style.display = '';
        // Year
        e = document.getElementById('modal-node-year');
        e.innerHTML = (obj.meta && obj.meta.year) ? obj.meta.year : '';
        e.style.display = '';
        // Countries
        e = document.getElementById('modal-node-countries');
        e.innerHTML = obj.countries.sort().join(", ");
        e.style.display = '';
    }

    // Subtitle Case study
    if (obj.type == 'casestudy') {
        let e = document.getElementById('modal-node-type');
        e.innerHTML = common_translations[language]['casestudy'];
        e.style.display = '';
    }

    // Subtitle Publication
    if (obj.type == 'publication') {
        let e = document.getElementById('modal-node-type');
        e.innerHTML = common_translations[language]['publication'];
        e.style.display = '';
    }

    // Description
    if (obj.meta && obj.meta.description && obj.type != 'sdg') {
        let e = document.getElementById('modal-node-description');
        e.innerHTML = obj.meta.description;
        e.style.display = '';
    }

    // Considerations
    if (obj.meta && obj.meta.considerations && obj.type == 'sdg') {
        let e = document.getElementById('modal-node-description');
        e.innerHTML = obj.meta.considerations;
        e.style.display = '';
    }

    // Link
    if (obj.meta && obj.meta.link && obj.type != 'sdg') {
        let translation_index = obj.type + '_more' in common_translations[language] ? obj.type + '_more' : 'node_more';
        let e = document.getElementById('modal-node-link');
        e.innerHTML = '<a href="' + obj.meta.link + '" target="_blank">' + common_translations[language][translation_index] + '</a>';
        e.style.display = '';
    }

    // Keywords
    if (obj.type == 'publication') {
        if (obj.meta && (obj.meta.keywords && obj.meta.keywords.length > 0)) {
            let e = document.getElementById('modal-node-keywords');
            let tags = '';
            for (keyword of obj.meta.keywords) {
                tags += '<li>' + keyword + '</li>';
            }
            e.innerHTML = tags;
            e.style.display = '';
        }
    }

    // Lists
    if (obj.type == 'sdg') {
        let e = document.getElementById('modal-node-lists');
        let lists = ['element', 'casestudy', 'publication'];
        let relations = get_relations(
            lists,
            'sdg',
            obj.id.split('_').slice(-1).pop(),
            ['related', 'primeExampleOf']
        );
        let html = '';
        // Build lists
        for (list of lists) {
            nodes = sort_nodes(relations[obj.id]['dst'][list]);
            if (nodes.length > 0) {
                html += '<div class="panel">';
                html += '<div id="list_' + list + '" class="panel-header"><span>▸</span>&nbsp;' + common_translations[language][list + '_plural'] + '</div>';
                html += '<ul>';
                for (node of nodes) {
                    let cls = '';
                    let countries = '';
                    if (list == 'publication') {
                        if (node[1]['predicate'] == 'primeExampleOf') cls = 'bold';
                    } else if (list == 'element') {
                        if (node[1]['weight'] == 3) cls = 'bold';
                        countries = [];
                        linked_countries = get_relations(['country'], 'element', node[0].split('_').slice(-1).pop())
                        for (country of Object.values(linked_countries[node[0]].dst.country)) {
                            countries.push(country.label);
                        }
                        countries = ' (' + countries.sort().join(', ') + ')';
                    } else if (list == 'casestudy') {
                        cls = 'bold';
                    }
                    let link = node[1].meta.link;
                    html += '<li class="' + cls + '"><a href="' + link + '" target="_blank">' + node[1].label + '</a>' + countries +'</li>';
                }
                html += '</ul></div>';
            }
        }
        html += '</ul>';
        e.innerHTML = html;
        e.style.display = '';
        // Respond to click events
        for (list of lists) {
            if (Object.keys(relations[obj.id]['dst'][list]).length > 0) {
            document.getElementById('list_' + list).onclick = function() {
                this.nextSibling.classList.toggle('panel-active');
                let arrow = this.firstChild;
                arrow.innerHTML = (arrow.innerHTML == '▸') ? '▾' : '▸';
            }
        }
        }
    }

    // Sustainability
    if (obj.type == 'element') {
        if (obj.meta && (obj.meta.sustainability && obj.meta.sustainability != '')) {
            let e_contrib = document.getElementById('modal-node-sustainability');
            let e_desc = document.getElementById('modal-node-description');
            let content = '';
            if (e_contrib != null) { // Show only on SDG
                // Get related SDG
                let relations = get_relations(
                    ['sdg'],
                    'element',
                    obj.id.split('_').slice(-1).pop(),
                    ['primeExampleOf']
                );
                try {
                    let sdg = Object.keys(relations[obj.id]["dst"]['sdg'])[0];
                    content = '<img src="icons/color/' + language + '/' + sdg + '.png" class="sdg-icon">';
                } catch(e) {}
                // Update content and display
                // e_contrib.innerHTML = common_translations[language]['sdg_contribution'];
                // e_contrib.style.display = '';
                e_desc.innerHTML = content + obj.meta.sustainability;
                e_desc.style.display = '';
            }
        }
    }

    // Navigate to other visualizations
    if (obj.type == 'element') {
        let e = document.getElementById('navigate');
        let id = obj.id.substr(8);
        let tags = '<p>' + common_translations[language]['element_context'] +'</p>';
        tags += '<a href="../constellation/?filter=' + id + '">' + common_translations[language]['menu_more_constellation'] + '</a>';
        tags += '<a href="../domain/?filter=' + id + '">' + common_translations[language]['menu_more_domain'] + '</a>';
        tags += '<a href="../biome/?filter=' + id + '">' + common_translations[language]['menu_more_biome'] + '</a>';
        tags += '<a href="../threat/?filter=' + id + '">' + common_translations[language]['menu_more_threat'] + '</a>';
        tags += '<a href="../sdg/?filter=' + id + '">' + common_translations[language]['menu_more_sdg'] + '</a>';
        e.innerHTML = tags;
        e.style.display = '';
    }

    // Permalink
    let permalink = document.getElementById('permalink');
    if (permalink !== null) {
        let url = window.location.protocol + '//' + window.location.host + window.location.pathname + '?focus=' + obj.id;
        let index = params.get('sdg-index') === null ? '' : '&sdg-index=' + params.get('sdg-index');
        url += index;
        permalink.setAttribute('style', 'display: block;');
        permalink.innerHTML = 'Permalink: <a href="' + url + '">' + url + '</a>';
    }

    // Show the modal
    node_modal.open("#chart-modal");

    // Carousel
    if (obj.type == 'element') {
        if (obj.meta && ((obj.meta.images && obj.meta.images.length > 0) || (obj.meta.video && obj.meta.video.length > 0))) {
            let glideDiv = document.createElement('div');
            glideDiv.setAttribute('class', 'slider__track glide__track');
            glideDiv.setAttribute('data-glide-el', 'track');

            let glideNextButton = document.createElement('button');
            glideNextButton.setAttribute('data-glide-dir', '>');
            glideNextButton.setAttribute('class', 'right');
            glideNextButton.innerHTML = '&#9654;';
            let glidePrevButton = document.createElement('button');
            glidePrevButton.setAttribute('data-glide-dir', '<');
            glidePrevButton.innerHTML = '&#9664;';

            let glideNPDiv = document.createElement('div');
            glideNPDiv.setAttribute('id', 'chart-modal-img-slider-controls');
            glideNPDiv.setAttribute('data-glide-el', 'controls');
            glideNPDiv.appendChild(glidePrevButton);
            glideNPDiv.appendChild(glideNextButton);

            let glideBulletDiv = document.createElement('div');
            glideBulletDiv.setAttribute('class', 'glide__bullets');
            glideBulletDiv.setAttribute('data-glide-el', 'controls[nav]');

            let cmp = 0;
            let glideUl = document.createElement('ul');
            if (obj.meta.video) {
                for(i = 0; i < obj.meta.video.length; i++) {
                    let glideLi = document.createElement('li');
                    glideLi.setAttribute('title', obj.meta.video[i].title + ' - ' + obj.meta.video[i].copyright);

                    let glideVideo = document.createElement('iframe');
                    glideVideo.src = obj.meta.video[i].url.replace('watch?v=', 'embed/') + '?rel=0&fs=0';

                    let glideVideoDesc = document.createElement('p');
                    glideVideoDesc.setAttribute('class', 'description');
                    glideVideoDesc.append(obj.meta.video[i].title);
                    let glideVideoCr = document.createElement('p');
                    glideVideoCr.setAttribute('class', 'copyright');
                    if (obj.meta.video[i].copyright !== "") glideVideoCr.append('© ' + obj.meta.video[i].copyright);

                    glideLi.appendChild(glideVideo);
                    glideLi.appendChild(glideVideoDesc);
                    glideLi.appendChild(glideVideoCr);
                    glideUl.appendChild(glideLi);

                    let bulletButton = document.createElement('button');
                    bulletButton.setAttribute('class', 'glide__bullet');
                    bulletButton.setAttribute('data-glide-dir', '='+cmp);
                    glideBulletDiv.appendChild(bulletButton);
                    cmp++;
                }
            }
            if (obj.meta.images) {
                for(i = 0; i < obj.meta.images.length; i++) {
                    let glideLi = document.createElement('li');
                    glideLi.setAttribute('title', obj.meta.images[i]['title'] + ' - ' + obj.meta.images[i]['copyright']);

                    let glideImg = new Image();
                    glideImg.alt = obj.meta.images[i]['title'];
                    glideImg.src = obj.meta.images[i]['url'];

                    let glideImgDesc = document.createElement('p');
                    glideImgDesc.setAttribute('class', 'description');
                    glideImgDesc.append(obj.meta.images[i]['title']);
                    let glideImgCr = document.createElement('p');
                    glideImgCr.setAttribute('class', 'copyright');
                    if (obj.meta.images[i]['copyright'] !== "") glideImgCr.append('© ' + obj.meta.images[i]['copyright']);

                    glideLi.appendChild(glideImg);
                    glideLi.appendChild(glideImgDesc);
                    glideLi.appendChild(glideImgCr);
                    glideUl.appendChild(glideLi);

                    let bulletButton = document.createElement('button');
                    bulletButton.setAttribute('class', 'glide__bullet');
                    bulletButton.setAttribute('data-glide-dir', '='+cmp);
                    glideBulletDiv.appendChild(bulletButton);
                    cmp++;
                }
            }
            glideDiv.appendChild(glideUl);

            let e = document.getElementById('chart-modal-img-slider');
            e.appendChild(glideDiv);
            e.appendChild(glideNPDiv);
            e.appendChild(glideBulletDiv);
            e.style.display = '';

            let glide = new Glide('#chart-modal-img-slider', { type: 'carousel', perView: 1 });
            glide.mount();
        }
    }

}

function closeModal() {
    node_modal.close("#chart-modal");
}

//Simple conversion from the node types to what is placed in the tooltip
function typeConversion(type) {
    if (type === "element") type = 'ich';
    else if (type === "casestudy") type = "case study"
    if (type in common_translations[language]) {
        return common_translations[language][type];
    } else {
        return type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
    }
}

// Scroll to carousel
function node_modal_init_scroll() {
    document.getElementById('modal-node-watch').innerHTML = '<a>' + common_translations[language]['watch'] + '</a>';
    document.querySelectorAll('#modal-node-watch a')[0].addEventListener('click', function() {
        let offset = document.getElementById('chart-modal-img-slider').offsetTop;
        document.querySelectorAll('.modal-inner')[0].scrollTop = offset;
    });
}

