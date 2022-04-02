var members = ['Tree', 'Kim', 'KKJ'];
console.log(members[1]); // Kim
var i = 0;
while (i < members.length) {
    console.log('array loop', members[i]);
    i++;
}

var roles = {
    'programmer':'KimTree',
    'designer':'KimKJ',
    'manager':'KKJ'
};
console.log(roles.designer); // KimKJ
console.log(roles['designer']); // KimKJ

for (var name in roles) {
    console.log('object =>', name, ', value =>', roles[name]);
}