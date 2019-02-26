module.exports = grammar({
  name: 'ocamlyacc',

  extras: $ => [
    /\s/,
    ';',
    $.line_comment,
    $.block_comment,
    $.ocaml_comment
  ],

  inline: $ => [
    $._terminal,
    $._nonterminal,
    $._symbol
  ],

  word: $ => $._identifier,

  rules: {
    grammar_specification: $ => seq(
      repeat($._declaration),
      '%%',
      repeat($._rule),
      optional(seq(
        '%%',
        alias(/.*/, $.ocaml)
      ))
    ),

    _declaration: $ => choice(
      $.header,
      $.token_declaration,
      $.start_declaration,
      $.type_declaration,
      $.priority_declaration,
      $.parameter_declaration,
      $.grammar_attribute,
      $.attribute_declaration,
      $.on_error_reduce_declaration
    ),

    header: $ => seq('%{', $.ocaml, '%}'),

    token_declaration: $ => seq(
      '%token',
      optional($.type),
      sep1(optional(','), $.terminal),
      repeat($.attribute)
    ),

    start_declaration: $ => seq(
      '%start',
      optional($.type),
      sep1(optional(','), $.nonterminal),
    ),

    type_declaration: $ => seq(
      '%type',
      $.type,
      sep1(optional(','), $.actual),
    ),

    actual: $ => seq(
      $._symbol,
      optional(parenthesize(sep1(',', $.actual))),
      repeat(choice('?', '+', '*'))
    ),

    priority_declaration: $ => seq(
      choive('%left', '%right', '%nonassoc'),
      repeat(seq(optional(','), $._symbol))
    ),

    parameter_declaration: $ => seq(
      '%parameter', '<',
      $._module_name,
      ':',
      $._module_type,
      '>'
    ),

    grammar_attribute: $ => seq(
      '%',
      $.attribute
    ),

    attribute_declaration: $ => seq(
      '%attribute',
      repeat(seq(optional(','), $.actual)),
      repeat($.attribute)
    ),

    on_error_reduce_declaration: $ => seq(
      '%on_error_reduce',
      repeat(seq(optional(','), $.actual))
    ),

    type: $ => seq('<', $.ocaml_type, '>'),

    attribute: $ => seq('[@', $.attribute_id, optional($.attribute_payload), ']'),
    attribute_id: $ => sep1('.', choice($._identifier, $._capitalized_identifier)),

    _identifier: $ => /[a-z_][a-zA-Z0-9_]*/,
    _capitalized_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,

    _terminal: $ => alias($._capitalized_identifier, $.terminal),
    _nonterminal: $ => alias($._identifier, $.nonterminal),
    _symbol: $ => choice($._terminal, $._nonterminal),

    line_comment: $ => token(seq(
      '//',
      /.*/
    )),

    block_comment: $ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/'
    ))
  },

  externals: $ => [
    $.ocaml_comment,
    '"',
    $.ocaml,
    $.ocaml_type,
    $.attribute_payload
  ]
})

function sep1(delimiter, rule) {
  return seq(rule, repeat(seq(delimiter, rule)))
}

function parenthesize(rule) {
  return seq('(', rule, ')')
}
