const {getBrowser} = require('../browser-common');
const {
  addThing,
  getProperty,
  waitForExpect,
} = require('./test-utils');
const ThingsPage = require('../page-object/things-page');

const STATIC_JS_PATH = '../../../../static/js';
const Utils = require(`${STATIC_JS_PATH}/utils`);


describe('Thing', () => {
  it('should render a thing and be able to change properties', async () => {
    const browser = getBrowser();
    const desc = {
      id: 'UnknownThings',
      name: 'foofoo',
      type: 'thing',
      properties: {
        numberProp: {
          value: 10,
          type: 'number',
          unit: 'percent',
        },
        stringProp: {
          value: 'bar',
          type: 'string',
        },
        booleanProp: {
          value: true,
          type: 'boolean',
        },
      },
    };
    await addThing(desc);

    const thingsPage = new ThingsPage(browser);
    thingsPage.open();

    await thingsPage.waitForThings();
    const things = await thingsPage.things();
    expect(things.length).toEqual(1);
    const thingName = await things[0].thingName();
    expect(thingName).toEqual('foofoo');

    const detailPage = await things[0].openDetailPage();

    await detailPage.waitForBooleanProperties();
    const booleanProps = await detailPage.booleanProperties();
    expect(booleanProps.length).toEqual(1);
    const booleanValue = await booleanProps[0].getValue();
    expect(booleanValue).toEqual('on');

    const numberProps = await detailPage.numberProperties();
    expect(numberProps.length).toEqual(1);
    let numberValue = await numberProps[0].getValue();
    expect(numberValue).toEqual('10');
    await numberProps[0].setValue('20');
    await waitForExpect(async () => {
      numberValue = await getProperty(desc.id, 'numberProp');
      expect(numberValue).toEqual(20);
    });

    const stringProps = await detailPage.stringProperties();
    expect(stringProps.length).toEqual(1);
    let stringValue = await stringProps[0].getValue();
    expect(stringValue).toEqual('bar');
    await stringProps[0].setValue('foo');
    await waitForExpect(async () => {
      stringValue = await getProperty(desc.id, 'stringProp');
      expect(stringValue).toEqual('foo');
    });
  });

  it('should render a thing with spaced property name', async () => {
    const browser = getBrowser();
    const desc = {
      id: 'spacedPropertyThings',
      name: 'battery sensor',
      type: 'thing',
      properties: {
        'spaced number': {
          value: 10,
          type: 'number',
          unit: 'percent',
        },
        'spaced string': {
          value: 'foo',
          type: 'string',
        },
        'spaced boolean': {
          value: true,
          type: 'boolean',
        },
      },
    };
    await addThing(desc);

    const thingsPage = new ThingsPage(browser);
    thingsPage.open();

    await thingsPage.waitForThings();
    const things = await thingsPage.things();
    expect(things.length).toEqual(1);
    const thingName = await things[0].thingName();
    expect(thingName).toEqual('battery sensor');

    const detailPage = await things[0].openDetailPage();

    await detailPage.waitForBooleanProperties();
    const booleanProps = await detailPage.booleanProperties();
    expect(booleanProps.length).toEqual(1);
    const booleanValue = await booleanProps[0].getValue();
    expect(booleanValue).toEqual('on');
    const booleanId = await booleanProps[0].getInputId();
    expect(booleanId).toEqual(
      `checkbox-${Utils.escapeHtmlForIdClass('spaced boolean')}`
    );

    const numberProps = await detailPage.numberProperties();
    expect(numberProps.length).toEqual(1);
    const numberValue = await numberProps[0].getValue();
    expect(numberValue).toEqual('10');
    const numberId = await numberProps[0].getInputId();
    expect(numberId).toEqual(
      `number-${Utils.escapeHtmlForIdClass('spaced number')}`
    );

    const stringProps = await detailPage.stringProperties();
    expect(stringProps.length).toEqual(1);
    const stringValue = await stringProps[0].getValue();
    expect(stringValue).toEqual('foo');
    const stringId = await stringProps[0].getInputId();
    expect(stringId).toEqual(
      `string-${Utils.escapeHtmlForIdClass('spaced string')}`
    );
  });
});
