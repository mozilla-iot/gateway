/**
 * ImageDetail
 *
 * A bubble showing an image icon, which, when clicked, expands to an image
 * view.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const API = require('../api');
const Utils = require('../utils');

class ImageDetail {
  constructor(thing, name, property) {
    this.thing = thing;
    this.name = name;
    this.label = property.label || name;
    this.id = `image-${Utils.escapeHtmlForIdClass(this.name)}`;

    this.imageHref = null;
    for (const link of property.links) {
      if (link.rel === 'alternate' && link.mediaType &&
          link.mediaType.startsWith('image/')) {
        this.imageHref = link.href;
        break;
      }
    }

    this.expandImage = this._expandImage.bind(this);
    this.reloadImage = this._reloadImage.bind(this);
  }

  /**
   * Attach to the view.
   */
  attach() {
    this.thing.element.querySelector(`#${this.id}`).addEventListener(
      'click',
      this.expandImage
    );
  }

  /**
   * Build the detail view.
   */
  view() {
    return `
      <webthing-image-property data-name="${Utils.escapeHtml(this.label)}"
        id="${this.id}">
      </webthing-image-property>`;
  }

  /**
   * Expand the image view.
   */
  _expandImage() {
    const element = document.createElement('div');
    element.classList.add('media-modal-backdrop');
    element.innerHTML = `
      <div class="media-modal">
        <div class="media-modal-close"></div>
        <div class="media-modal-frame">
          <img class="media-modal-image"></img>
        </div>
        <div class="media-modal-refresh"></div>
      </div>
      `;

    document.body.appendChild(element);

    element.querySelector('.media-modal-close').addEventListener(
      'click',
      () => {
        document.body.removeChild(element);
      }
    );

    element.querySelector('.media-modal-refresh').addEventListener(
      'click',
      this.reloadImage
    );

    this.reloadImage();
  }

  _reloadImage() {
    if (this.imageHref === null) {
      return;
    }

    const img = document.querySelector('.media-modal-image');
    if (!img) {
      return;
    }

    fetch(this.imageHref, {
      headers: {
        Authorization: `Bearer ${API.jwt}`,
      },
      cache: 'reload',
    }).then((res) => {
      return res.blob();
    }).then((data) => {
      img.src = URL.createObjectURL(data);
    }).catch((e) => {
      console.error(`Failed to load image: ${e}`);
    });
  }
}

module.exports = ImageDetail;
