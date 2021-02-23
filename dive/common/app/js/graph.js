'use strict';

/**
 * Get nodes of given types related to a given node type.
 * This function expects to find the `graph` object in the global namespace.
 *
 * @example get_relations_by_type('element', ['sdg']);
 *
 * @param {array} dst_types - The list of relation types to look for
 * @param {string} src_type - The node type
 * @param {int} [src_id] - The optional node ID for further filtering
 * @param {array} [predicate] - The list of predicates that must match
 * @return {array}
 */
function get_relations(dst_types, src_type, src_id, predicates) {

    // Prepare the return array
    let relations = [];

    // The graph object must be in the global namespace
    if (typeof data === 'undefined') return relations;

    // Default predicates
    if (predicates === undefined) predicates = ['related'];

    // Filter
    function match(key, predicate) {
        if (predicates.length > 0 && !(predicates.includes(predicate))) return false;
        if (src_id) return key == src_type + '_' + src_id;
        return get_type(key) == src_type;
    }

    // Update
    function update(src, dst, predicate, weight) {
        let type = get_type(dst);
        if (dst_types.includes(type)) {
            if (!(src in relations)) {
                relations[src] = {
                    'src': data['nodes'][src],
                    'dst': []
                };
                for (let type of dst_types) relations[src]['dst'][type] = [];
            }
            relations[src]['dst'][type][dst] = [];
            Object.assign(relations[src]['dst'][type][dst], data['nodes'][dst]); // Deep copy
            relations[src]['dst'][type][dst]['predicate'] = predicate;
            relations[src]['dst'][type][dst]['weight'] = weight;
        }
    }

    // Loop through edges
    for (let edge of data['edges']) {
        if (match(edge['subject'], edge['predicate'])) {
            update(edge['subject'], edge['object'], edge['predicate'], edge['weight']);
        } else if (match(edge['object'], edge['predicate'])) {
            update(edge['object'], edge['subject'], edge['predicate'], edge['weight']);
        }
    }

    return relations;
}

/**
 * Get the type of a node_id
 *
 * @param {string} node_id - The node ID
 * @return {string} The type
 */
function get_type(node_id) {
    return /(.*)_[0-9]+$/.exec(node_id)[1];
}

/**
 * Sort an object of nodes by label
 *
 * @param {array} nodes - The object of nodes
 * @return {array} The sorted array
 */
function sort_nodes(nodes) {
    return Object.entries(nodes).sort((a, b) => a[1].label.localeCompare(b[1].label));
}

