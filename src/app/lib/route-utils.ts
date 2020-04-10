import { PRIMARY_OUTLET } from '@angular/router';
import * as _ from 'lodash';

export function getRoutelet(router, routelet) {
    const tree = router.parseUrl(router.url);

    return tree.root.children[PRIMARY_OUTLET] &&
        tree.root.children[PRIMARY_OUTLET].segments &&
        tree.root.children[PRIMARY_OUTLET].segments.length === 5
        ? _.last(tree.root.children[PRIMARY_OUTLET].segments).path
        : routelet;
}

