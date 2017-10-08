import Item from 'playlist/item';
import ProvidersSupported from 'providers/providers-supported';
import registerProvider from 'providers/providers-register';
import { module as ControlsModule } from 'controller/controls-loader';
import Promise, { resolved } from 'polyfills/promise';

let bundlePromise = null;

export const bundleContainsProviders = {};

export default function loadCoreBundle(model) {
    if (!bundlePromise) {
        bundlePromise = selectBundle(model);
    }
    return bundlePromise;
}

export function chunkLoadErrorHandler(/* error */) {
    // Webpack require.ensure error: "Loading chunk 3 failed"
    throw new Error('Network error');
}

export function selectBundle(model) {
    //新增hlsjs处理
    let bunlde;
    const controls = model.get('controls');
    const polyfills = requiresPolyfills();
    const html5Provider = requiresProvider(model, 'html5');
    const hlsjsProvider = requiresProvider(model, 'hlsjs');

    if (controls && polyfills && html5Provider) {
        bunlde = loadControlsPolyfillHtml5Bundle();
    }else if (controls && html5Provider) {
        bunlde = loadControlsHtml5Bundle();
    }else if (controls && polyfills) {
        bunlde = loadControlsPolyfillBundle();
    }else if (controls) {
        bunlde = loadControlsBundle();
    }else {
      bunlde = loadCore();
    }
    return new Promise(function(resolve,reject){
        bunlde.then(function(bun){
            if(hlsjsProvider) {
                require.ensure([
                    'hls.js',
                    'providers/html5'
                ], function (require) {
                    const hlsjs = require('hls.js');
                    const h5Provider = require('providers/html5').default;
                    h5Provider.prototype.hlsjs = hlsjs;
                    registerProvider(h5Provider,true); 
                    bun.prototype.hlsjs = hlsjs;
                    resolve(bun);
                }, chunkLoadErrorHandler, 'provider.hlsjs.js');
            }else {
                resolve(bun);
            }
        })
    })
}

export function requiresPolyfills() {
    const IntersectionObserverEntry = window.IntersectionObserverEntry;
    return !IntersectionObserverEntry ||
        !('IntersectionObserver' in window) ||
        !('intersectionRatio' in IntersectionObserverEntry.prototype);
}

export function requiresProvider(model, providerName) {
    const playlist = model.get('playlist');
    if (Array.isArray(playlist) && playlist.length) {
        const sources = Item(playlist[0]).sources;
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const providersManager = model.getProviders();
            for (let j = 0; j < ProvidersSupported.length; j++) {
                const provider = ProvidersSupported[j];
                if (providersManager.providerSupports(provider, source)) {
                    return (provider.name === providerName);
                }
            }
        }
    }
    return false;
}

function loadControlsPolyfillHtml5Bundle() {
    bundleContainsProviders.html5 = true;
    return require.ensure([
        'controller/controller',
        'view/controls/controls',
        'intersection-observer',
        'providers/html5'
    ], function (require) {
        // These modules should be required in this order
        require('intersection-observer');
        const CoreMixin = require('controller/controller').default;
        ControlsModule.controls = require('view/controls/controls').default;
        registerProvider(require('providers/html5').default);
        return CoreMixin;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls.polyfills.html5');
}

function loadControlsHtml5Bundle() {
    bundleContainsProviders.html5 = true;
    return require.ensure([
        'controller/controller',
        'view/controls/controls',
        'providers/html5'
    ], function (require) {
        const CoreMixin = require('controller/controller').default;
        ControlsModule.controls = require('view/controls/controls').default;
        registerProvider(require('providers/html5').default);
        return CoreMixin;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls.html5');
}

function loadControlsPolyfillBundle() {
    return require.ensure([
        'controller/controller',
        'view/controls/controls',
        'intersection-observer'
    ], function (require) {
        require('intersection-observer');
        const CoreMixin = require('controller/controller').default;
        ControlsModule.controls = require('view/controls/controls').default;
        return CoreMixin;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls.polyfills');
}

function loadControlsBundle() {
    return require.ensure([
        'controller/controller',
        'view/controls/controls'
    ], function (require) {
        const CoreMixin = require('controller/controller').default;
        ControlsModule.controls = require('view/controls/controls').default;
        return CoreMixin;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls');
}

function loadCore() {
    return loadIntersectionObserverIfNeeded().then(() => {
        return require.ensure([
            'controller/controller'
        ], function (require) {
            return require('controller/controller').default;
        }, chunkLoadErrorHandler, 'jwplayer.core');
    });
}

function loadIntersectionObserverIfNeeded() {
    if (requiresPolyfills()) {
        return require.ensure([
            'intersection-observer'
        ], function (require) {
            return require('intersection-observer');
        }, chunkLoadErrorHandler, 'polyfills.intersection-observer');
    }
    return resolved;
}
