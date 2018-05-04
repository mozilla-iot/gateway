const {Page, Section} = require('./elements');
const BACKSPACE_UNICODE = '\uE003';
const ENTER_UNICODE = '\uE007';
class InputPropertySection extends Section {
  constructor(browser, rootElement) {
    super(browser, rootElement);
    this.defineElement('input', 'input');
    this.defineElement('form', 'form');
  }

  async getInputId() {
    const input = await this.input();
    const data = await this.browser.elementIdProperty(
      input.value ? input.value.ELEMENT : input.ELEMENT,
      'id'
    );
    return data.value;
  }

  async getValue() {
    const input = await this.input();
    const data = await this.browser.elementIdProperty(
      input.value ? input.value.ELEMENT : input.ELEMENT,
      'value'
    );
    return data.value;
  }

  async setValue(value) {
    const text = await this.getValue();
    const keys = [];
    for (let i = 0; i < text.length; i++) {
      keys.push(BACKSPACE_UNICODE);
    }
    keys.push(value);
    keys.push(ENTER_UNICODE);
    const input = await this.input();
    await this.browser.elementIdValue(
      input.value ? input.value.ELEMENT : input.ELEMENT,
      keys
    );
  }
}

class ColorPropertySection extends InputPropertySection {
}

class ColorTemperaturePropertySection extends InputPropertySection {
}

class LabelPropertySection extends Section {
  async getDisplayedValue() {
    const element = this.rootElement;
    return await this.browser.elementIdText(
      element.value ? element.value.ELEMENT : element.ELEMENT
    );
  }
}

class LevelPropertySection extends InputPropertySection {
}

class OnOffPropertySection extends InputPropertySection {
}

class BooleanPropertySection extends InputPropertySection {
  async click() {
    // TODO
    // browser.click method dose not work well.
  }
}

class StringPropertySection extends InputPropertySection {
}

class NumberPropertySection extends InputPropertySection {
}

class ThingDetailPage extends Page {
  constructor(browser, url) {
    super(browser, url);

    this.defineSection(
      'colorProperty',
      '.color-light-color',
      ColorPropertySection
    );

    this.defineSection(
      'colorTemperatureProperty',
      '.color-temperature',
      ColorTemperaturePropertySection
    );

    this.defineSection(
      'levelProperty',
      '.level',
      LevelPropertySection
    );

    this.defineSection(
      'onOffProperty',
      '.switch',
      OnOffPropertySection
    );

    this.defineSections(
      'labelProperties',
      '.generic-label',
      LabelPropertySection
    );

    // UnknownThing
    this.defineSections(
      'booleanProperties',
      '.boolean-switch',
      BooleanPropertySection
    );
    this.defineSections(
      'stringProperties',
      '.string-input',
      StringPropertySection
    );
    this.defineSections(
      'numberProperties',
      '.number-input',
      NumberPropertySection
    );
  }
}

module.exports = ThingDetailPage;
