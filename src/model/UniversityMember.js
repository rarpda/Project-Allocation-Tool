/**
 * This class models the University Member object for this application,
 * It forms the basis for both the student and the supervisor class.
 * @class UniversityMember
 * */
class UniversityMember {

    /**
     * Constructor for the university member class.
     * @param engagementNumber The engagement number of the staff.
     * @param id The id number for the person.
     * @param username The _username of the person registered.
     * @param title The _title of the person.
     * @param givenNames The first name(s) of the person.
     * @param familyName The surname of the person.
     * @param email The _email registered on the database.
     * */
    constructor(engagementNumber, id, username, title, givenNames, familyName, email) {
        this.engagementNumber = engagementNumber;
        this.Id = id;
        this.username = username;
        this.title = title;
        this.givenNames = givenNames;
        this.familyName = familyName;
        this.email = email;
    }
}

module.exports = UniversityMember;



