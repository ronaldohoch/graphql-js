/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { expect } from 'chai';
import { parse } from '../../language';
import { validateDocument } from '../';
import { allRules } from '../allRules';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID
} from '../../type';


var Being = new GraphQLInterfaceType({
  name: 'Being',
  fields: () => ({
    name: { type: GraphQLString }
  }),
});

var Pet = new GraphQLInterfaceType({
  name: 'Pet',
  fields: () => ({
    name: { type: GraphQLString }
  }),
});

var DogCommand = new GraphQLEnumType({
  name: 'DogCommand',
  values: {
    SIT: { value: 0 },
    HEEL: { value: 1 },
    DOWN: { value: 2 },
  },
});

var Dog = new GraphQLObjectType({
  name: 'Dog',
  fields: () => ({
    name: { type: GraphQLString },
    nickname: { type: GraphQLString },
    barkVolume: { type: GraphQLInt },
    barks: { type: GraphQLBoolean },
    doesKnowCommand: {
      type: GraphQLBoolean,
      args: {
        dogCommand: { type: DogCommand },
      },
    },
    isHousetrained: {
      type: GraphQLBoolean,
      args: {
        atOtherHomes: {
          type: GraphQLBoolean,
          defaultValue: true,
        }
      },
    },
    isAtLocation: {
      type: GraphQLBoolean,
      args: { x: { type: GraphQLInt }, y: { type: GraphQLInt } },
    },
  }),
  interfaces: [ Being, Pet ],
});

var Cat = new GraphQLObjectType({
  name: 'Cat',
  fields: () => ({
    name: { type: GraphQLString },
    nickname: { type: GraphQLString },
    meows: { type: GraphQLBoolean },
    meowVolume: { type: GraphQLInt },
    furColor: { type: FurColor },
  }),
  interfaces: [ Being, Pet],
});

var CatOrDog = new GraphQLUnionType({
  name: 'CatOrDog',
  types: [Dog, Cat],
  resolveType(/*value*/) {
    // not used for validation
    return null;
  }
});

var Intelligent = new GraphQLInterfaceType({
  name: 'Intelligent',
  fields: {
    iq: { type: GraphQLInt }
  }
});

var Human = new GraphQLObjectType({
  name: 'Human',
  interfaces: [ Being, Intelligent ],
  fields: {
    name: {
      args: { surname: { type: GraphQLBoolean } },
      type: GraphQLString
    },
    pets: { type: new GraphQLList(Pet) },
    relatives: { type: new GraphQLList(Human) },
    iq: { type: GraphQLInt },
  }
});

var Alien = new GraphQLObjectType({
  name: 'Alien',
  interfaces: [ Being, Intelligent ],
  fields: {
    iq: { type: GraphQLInt },
    numEyes: { type: GraphQLInt },
  }
});

var DogOrHuman = new GraphQLUnionType({
  name: 'DogOrHuman',
  types: [Dog, Human],
  resolveType(/*value*/) {
    // not used for validation
    return null;
  }
});

var HumanOrAlien = new GraphQLUnionType({
  name: 'HumanOrAlien',
  types: [Human, Alien],
  resolveType(/*value*/) {
    // not used for validation
    return null;
  }
});

var FurColor = new GraphQLEnumType({
  name: 'FurColor',
  values: {
    BROWN: { value: 0 },
    BLACK: { value: 1 },
    TAN: { value: 2 },
    SPOTTED: { value: 3 },
  },
});

var ComplexInput = new GraphQLInputObjectType({
  name: 'ComplexInput',
  fields: {
    requiredField: { type: new GraphQLNonNull(GraphQLBoolean) },
    intField: { type: GraphQLInt },
    stringField: { type: GraphQLString },
    booleanField: { type: GraphQLBoolean },
    stringListField: { type: new GraphQLList(GraphQLString) },
  }
});

var ComplicatedArgs = new GraphQLObjectType({
  name: 'ComplicatedArgs',
  // TODO List
  // TODO Coercion
  // TODO NotNulls
  fields: () => ({
    intArgField: {
      type: GraphQLString,
      args: { intArg: { type: GraphQLInt } },
    },
    nonNullIntArgField: {
      type: GraphQLString,
      args: { nonNullIntArg: { type: new GraphQLNonNull(GraphQLInt) } },
    },
    stringArgField: {
      type: GraphQLString,
      args: { stringArg: { type: GraphQLString } },
    },
    booleanArgField: {
      type: GraphQLString,
      args: { booleanArg: { type: GraphQLBoolean } },
    },
    enumArgField: {
      type: GraphQLString,
      args: { enumArg: { type: FurColor } },
    },
    floatArgField: {
      type: GraphQLString,
      args: { floatArg: { type: GraphQLFloat } },
    },
    idArgField: {
      tyoe: GraphQLString,
      args: { idArg: { type: GraphQLID } },
    },
    stringListArgField: {
      type: GraphQLString,
      args: { stringListArg: { type: new GraphQLList(GraphQLString) } },
    },
    complexArgField: {
      type: GraphQLString,
      args: { complexArg: { type: ComplexInput } },
    },
    multipleReqs: {
      type: GraphQLString,
      args: {
        req1: { type: new GraphQLNonNull(GraphQLInt) },
        req2: { type: new GraphQLNonNull(GraphQLInt) },
      },
    },
    multipleOpts: {
      type: GraphQLString,
      args: {
        opt1: {
          type: GraphQLInt,
          defaultValue: 0,
        },
        opt2: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
    },
    multipleOptAndReq: {
      type: GraphQLString,
      args: {
        req1: { type: new GraphQLNonNull(GraphQLInt) },
        req2: { type: new GraphQLNonNull(GraphQLInt) },
        opt1: {
          type: GraphQLInt,
          defaultValue: 0,
        },
        opt2: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
    },
  }),
});


var QueryRoot = new GraphQLObjectType({
  name: 'QueryRoot',
  fields: () => ({
    human: {
      args: { id: { type: GraphQLID } },
      type: Human
    },
    alien: { type: Alien },
    dog: { type: Dog },
    cat: { type: Cat },
    pet: { type: Pet },
    catOrDog: { type: CatOrDog },
    dogOrHuman: { type: DogOrHuman },
    humanOrAlien: { type: HumanOrAlien },
    complicatedArgs: { type: ComplicatedArgs },
  })
});

var defaultSchema = new GraphQLSchema({
  query: QueryRoot
});

function expectValid(schema, rules, queryString) {
  expect(validateDocument(schema, parse(queryString), rules)).to.deep.equal(
    { isValid: true, errors: null}
  );
}

function expectInvalid(schema, rules, queryString, errors) {
  var result = validateDocument(schema, parse(queryString), rules);
  expect(result.isValid).to.equal(false, 'GraphQL should not validate');
  expect(result.errors).to.deep.equal(errors);
  return result;
}

export function expectPassesRule(rule, queryString) {
  return expectValid(defaultSchema, [rule], queryString);
}

export function expectFailsRule(rule, queryString, errors) {
  return expectInvalid(defaultSchema, [rule], queryString, errors);
}

export function expectPassesRuleWithSchema(schema, rule, queryString, errors) {
  return expectValid(schema, [rule], queryString, errors);
}

export function expectFailsRuleWithSchema(schema, rule, queryString, errors) {
  return expectInvalid(schema, [rule], queryString, errors);
}

export function expectPassesCompleteValidation(queryString) {
  return expectValid(defaultSchema, allRules, queryString);
}

export function expectFailsCompleteValidation(queryString, errors) {
  return expectInvalid(defaultSchema, allRules, queryString, errors);
}
