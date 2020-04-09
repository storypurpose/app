import { PRIMARY_OUTLET } from '@angular/router';
import * as _ from 'lodash';

export function getRoutelet(router, routelet) {
    const tree = router.parseUrl(router.url);
    if (tree.root.children[PRIMARY_OUTLET] && tree.root.children[PRIMARY_OUTLET].segments) {
        const found = _.last(tree.root.children[PRIMARY_OUTLET].segments);
        if (found && found.path && found.path.length > 0) {
            routelet = found.path;
        }
    }
    return routelet;
}

