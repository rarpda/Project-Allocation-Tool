const studentNumber = 15;
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
const surnames = [ "Jones", "Smith", "Ramirez", "O'Connor", "Rahman", "Summer", "McDonald", "Baresi",
    "Jordan", "Bellafonte", "Presley", "May", "Robinson", "von Hasenpfeffer", "de la Rue", "Roberts",
    "Hodgekin", "Tamagochi", "Zhao", "Hazelnut", "Henderson", "Trapp", "Santorini", "Clinton", "Clarke" ];
const courses_ug = [
    "BSc (Hons) Computer Science", "MSci (Hons) Computer Science",
    "BSc (Hons) Computer Science and Mathematics", "BSc (Hons) Computer Science and Physics",
    "BSc (Hons) Computer Science and Philosopy", "BSc (Hons) Computer Science and Psychology" ];
const courses_pg = [
    "MSc Advanced Computer Science", "MSc Software Engineering", "MSc Computing and IT",
    "MSc Management and IT", "MSc Artificial Intelligence", "MSc Data Intensive Analysis",
    "MSc Human Computer Interaction", "MSc Information Technology" ];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const school_name = [
    "Sunnyvale","Johnson", "Midvale", "Caramba","Rock'n'Roll", "Maths and Maths", "Advanced Academy",
    "East London", "Organic", "XYZ", "Hogwarts", "Detroit", "Shanghai", "Madras", "Durban", "Rome" ];
const school_type = [
    "Academy","High School", "Secondary School", "Gymnasium", "Grammar School", "College", "International School" ];

function r(limit) {
    return Math.floor((Math.random() * limit) + 1);
}

function rs(array) {
    return array[r(array.length)-1];
}

function generateBirthdate() {
    let day = r(28);
    let month = months[r(12)];
    let year = 1980 + r(20);

    return '' + day + '-' + month + '-' + year;
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
    line += '"Student ID",';
    line += '"Username",';
    line += '"Title",';
    line += '"Given names",';
    line += '"Family name",';
    line += '"Email",';
    line += '"Date of birth",';
    line += '"Full/part time",';
    line += '"Registration status",';
    line += '"Qualification awarded",';
    line += '"Class awarded",';
    line += '"Faculty",';
    line += '"Student type",';
    line += '"Programme name",';
    line += '"Degree intention",';
    line += '"Degree intention (code)",';
    line += '"Last School"';

    return line;
}
function generateLine() {
    let line = '';

    let id = generateID();
    let title = ( r(2) == 1 ? 'Mr' : 'Miss' );
    let first = ( title == 'Mr' ? rs(names_male) : rs(names_female) );
    let last = rs(surnames);
    let username = generateUsername(first,last);
    let programme = ( level == "U" ? rs(courses_ug) : rs(courses_pg) );

    line += '"' + id + '/1' + '",';
    line += '"' + id + '",';
    line += '"' + username + '",';
    line += '"' + title + '",';
    line += '"' + first + '",';
    line += '"' + last + '",';
    line += '"' + username+'@st-andrews.ac.uk",';
    line += '"' + generateBirthdate() + '",';
    line += '"Full-time",';
    line += '"Registered",';
    line += '"","","Science",';
    line += '"' + level + '",';
    line += '"' + programme + '",';
    line += '"' + programme + '",';
    line += '"USHFCSCSCSC",';
    line += '"' + rs(school_name) + ' ' + rs(school_type) + '"';

    return line;
}

(function main() {
    console.log(generateHeader());

    for(let i=0; i<studentNumber; i++) {
        console.log(generateLine());
    }
})();
