module.exports = {
  startStandalone: true,
  login: [{
    title: 'Username',
    type: 'string',
    strongtype: 'String'
  },{
    title: 'Password',
    type: 'string',
    strongtype: 'String'
  }],
  userInvoke: [{
    title: 'Session ID',
    type: 'string'
  },{
    title: 'Method name',
    type: 'string'
  },{
    title: 'Invocation parameters',
    type: 'array'
  }]
};
