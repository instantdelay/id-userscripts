// ==UserScript==
// @name         BetterAtlasObscura
// @namespace    http://instantdelay.com/
// @version      0.1
// @description  Improve Atlas Obscura maps
// @author       Spencer Van Hoose
// @match        https://www.atlasobscura.com/*
// @icon         https://www.google.com/s2/favicons?domain=atlasobscura.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    function improveMap() {
        const visited = GM_getValue('visited') ? JSON.parse(GM_getValue('visited')) : [];
        const visitedIds = {};
        for (let i = 0; i < visited.length; i++) {
            visitedIds[visited[i].id] = true;
        }

        const clusterer = unsafeWindow.AtlasObscura.mapFeatures.markerClusterer;
        const map = clusterer.map;
        const markers = clusterer.markers_;

        map.addListener('bounds_changed', () => {
            GM_setValue('lastBounds', JSON.stringify(map.getBounds()));
        });

        for (let i = 0; i < markers.length; i++) {
            if (markers[i].id in visitedIds) {
                markers[i].setOpacity(0.3);
            }
        }

        const previousBoundsJson = GM_getValue('lastBounds');
        if (previousBoundsJson) {
            map.fitBounds(JSON.parse(previousBoundsJson));
        }

        const viewAllButton = document.createElement('button');
        viewAllButton.innerText = 'View All';
        viewAllButton.addEventListener('click', () => map.fitBounds({ east: 150, west: -150, north: 70, south: -70 }));

        const mapDiv = document.querySelector('#map-the-atlas');
        mapDiv.insertAdjacentElement('beforebegin', viewAllButton);
    }

    if (unsafeWindow.AtlasObscura.current_user && document.location.pathname.startsWith('/users/' + unsafeWindow.AtlasObscura.current_user.username)) {
        const profile = unsafeWindow.AtlasObscura.user_profile;
        console.log('Updating cache with %d visited places', profile.user.places.length);
        GM_setValue('visited', JSON.stringify(profile.user.places));
    }
    else if (document.location.pathname.startsWith('/articles/all-places')) {
        improveMap();
        document.querySelector('.js-podcast-banner').remove();
        document.querySelector('.ArticleHeader__title').style.marginBottom = '0';
        document.querySelector('.ArticleHeader__subtitle').remove();
        document.querySelector('.ArticleHeader').style.padding = '2.5rem 0';
    }
    else if (document.location.pathname.startsWith('/places/')) {
        const beenToBtn = document.querySelector('.action-text-been-to');
        beenToBtn.addEventListener('click', () => {
            const markingVisited = beenToBtn.parentNode.classList.contains('inactive');
            let visitedPlaces = GM_getValue('visited') ? JSON.parse(GM_getValue('visited')) : [];
            const place = unsafeWindow.AtlasObscura.current_place;
            if (markingVisited) {
                visitedPlaces.push(place);
            }
            else {
                visitedPlaces = visitedPlaces.filter(item => item.id != place.id);
            }
            GM_setValue('visited', JSON.stringify(visitedPlaces));
        });
    }
})();