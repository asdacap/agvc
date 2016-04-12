// Place where initial stuff lives

if(Meteor.isClient){
  require('/imports/client/boot');
}

if(Meteor.isServer){
  require('/imports/server/boot');
}
