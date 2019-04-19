var lr = ALLEX.execSuite.libRegistry;
lr.register('vektr_commonlib',
  require('./index')(
    ALLEX,
    lr.get('vektr_mathlib')
  )
);
