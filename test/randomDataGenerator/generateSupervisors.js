const staffNumber = 15;
const level = "P";

const names_male = [
    "James", "Donald", "Rob", "Zack", "Jimmy", "Benny", "Robert", "Stuart", "Caleb", "Jing", "Terry",
    "Brian", "John", "Jack", "Callum", "Rory", "Alan", "Sven", "Dick", "Stan", "Gary", "Simon", "Miles",
    "Giles", "Ronald", "Abdul", "Niv", "Hidehiko", "Rambo", "Elvis", "Will", "Harry", "Philip", "George",
    "Jeremy", "Alex", "Omar", "Chris", "Norm", "Warren", "Julian", "Francois", "Carsten" ];
const names_female = [
    "Stella", "Jane", "Linda", "Mercedes", "Eva", "Natasha", "Selma", "Vera", "Beth", "Lucy", "Lauren",
    "Sandra", "Sally", "Julia", "Donna", "Rachel", "Tina", "Sarah", "Jenny", "Cath", "Siobhan", "Lily",
    "Francesca", "Dorothy", "Alice", "Ophelia", "Cordelia", "Elizabeth", "Norma", "Jean", "April", "Anne",
    "Gemma", "Layla", "Juanita", "Rose", "Susan", "Ingrid", "Pippa", "Sandy", "Brandy", "Jocelyn" ];
const surnames = [ "Gerrard", "Scholes", "Sterling", "O'Connor", "Rahman", "Henderson", "Milner", "Baresi",
    "Jordan", "Bellafonte", "Presley", "May", "Robinson", "Southgate", "de la Rue", "Roberts",
    "Hodgekin", "Honda", "Zhao", "Hazelnut", "Robinho", "Neur", "Santorini", "Pirlo", "Inzhagi" ];


function r(limit) {
    return Math.floor((Math.random() * limit) + 1);
}

function rs(array) {
    return array[r(array.length)-1];
}


function generateID() {
    let id = '';
    for(i=0;i<9;i++) {
        let number = r(9);
        id = id + number;
    }
    return id;
}

function generateUsername(firstname, lastname) {
    let randnum = r(800)+100;
    return (firstname[0] + lastname[0] + randnum).toLowerCase();
}

function generateHeader() {
    let line = "";

    line += '"Engagement no",';
    line += '"Staff ID",';
    line += '"Username",';
    line += '"Title",';
    line += '"Given names",';
    line += '"Family name",';
    line += '"Email",';


    return line;
}
function generateLine() {
    let line = '';

    let id = generateID();
    let title = ( r(2) == 1 ? 'Mr' : 'Miss' );
    let first = ( title == 'Mr' ? rs(names_male) : rs(names_female) );
    let last = rs(surnames);
    let username = generateUsername(first,last);

    line += '"' + id + '/1' + '",';
    line += '"' + id + '",';
    line += '"' + username + '",';
    line += '"' + title + '",';
    line += '"' + first + '",';
    line += '"' + last + '",';
    line += '"' + username+'@st-andrews.ac.uk",';

    return line;
}

(function main() {
    console.log(generateHeader());

    for(let i=0; i<staffNumber; i++) {
        console.log(generateLine());
    }
})();
