'use strict';

exports.layerMapping = {
  LayerType: {
    Precomp: 0,
    Solid: 1,
    Image: 2,
    Null: 3,
    Shape: 4,
    Text: 5,
    Unknown: 6,
  },

  MatteType: {
    None: 0,
    Add: 1,
    Invert: 2,
    Unknown: 3,
  },

  maskMode: {
    None: 'n',
    Additive: 'a',
    Subtract: 's',
    Intersect: 'i',
    Lighten: 'l',
    Darken: 'd',
    Difference: 'f',
  },
};
