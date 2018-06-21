/**
 * On/Off Switch.
 *
 * UI element representing an On/Off Switch.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const API = require('./api');
const Thing = require('./thing');
const OnOffDetail = require('./on-off-detail');

/**
 * OnOffSwitch Constructor (extends Thing).
 *
 * @param Object description Thing description object.
 * @param {String} format 'svg' or 'html'.
 */
const OnOffSwitch = function(description, format) {
  this.displayedProperties = this.displayedProperties || {};
  if (description.properties) {
    this.displayedProperties.on = {
      href: description.properties.on.href,
      detail: new OnOffDetail(this, 'on', description.properties.on.label),
    };
  }

  this.base = Thing;
  this.base(description, format, {svgBaseIcon: '/images/on-off-switch.svg',
                                  pngBaseIcon: '/images/on-off-switch.png'});

  if (format === 'svg') {
    // For now the SVG view is just a link.
    return this;
  }

  this.switch = this.element.querySelector('webthing-on-off-switch-capability');

  if (format === 'htmlDetail') {
    this.attachHtmlDetail();
  } else {
    this.switch.addEventListener('click', this.handleClick.bind(this));
  }

  this.updateStatus();

  return this;
};

OnOffSwitch.prototype = Object.create(Thing.prototype);

/**
 * Update the display for the provided property.
 * @param {string} name - name of the property
 * @param {*} value - value of the property
 */
OnOffSwitch.prototype.updateProperty = function(name, value) {
  switch (name) {
    case 'on':
      this.updateOn(value);
      break;
  }
};

OnOffSwitch.prototype.updateOn = function(on) {
  this.properties.on = on;
  if (on === null) {
    return;
  }

  if (this.format === 'htmlDetail') {
    this.displayedProperties.on.detail.update();
  }

  if (on) {
    this.showOn();
  } else {
    this.showOff();
  }
};

/**
 * Show on state.
 */
OnOffSwitch.prototype.showOn = function() {
  this.switch.on = true;
};

/**
 * Show off state.
 */
OnOffSwitch.prototype.showOff = function() {
  this.switch.on = false;
};

/**
 * Show transition state.
 */
OnOffSwitch.prototype.showTransition = function() {
  this.switch.on = null;
};

/**
 * Handle a click on the on/off switch.
 */
OnOffSwitch.prototype.handleClick = function() {
  if (this.properties.on === true) {
    this.turnOff();
  } else if (this.properties.on === false) {
    this.turnOn();
  }
};

/**
 * Send a request to turn on and update state.
 *
 */
OnOffSwitch.prototype.turnOn = function() {
  this.showTransition();
  this.properties.on = null;
  const payload = {
    on: true,
  };
  fetch(this.displayedProperties.on.href, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${API.jwt}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (response.status == 200) {
      return response.json();
    } else {
      throw new Error(`Status ${response.status} trying to turn on switch`);
    }
  }).then((json) => {
    this.onPropertyStatus(json);
  }).catch((error) => {
    console.error(`Error trying to turn on switch: ${error}`);
  });
};

/**
 * Send a request to turn off and update state.
 */
OnOffSwitch.prototype.turnOff = function() {
  this.showTransition();
  this.properties.on = null;
  const payload = {
    on: false,
  };
  fetch(this.displayedProperties.on.href, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${API.jwt}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (response.status == 200) {
      return response.json();
    } else {
      throw new Error(`Status ${response.status} trying to turn off switch`);
    }
  }).then((json) => {
    this.onPropertyStatus(json);
  }).catch((error) => {
    console.error(`Error trying to turn off switch: ${error}`);
  });
};

OnOffSwitch.prototype.iconView = function() {
  return `
    <webthing-on-off-switch-capability>
    </webthing-on-off-switch-capability>`;
};

module.exports = OnOffSwitch;
