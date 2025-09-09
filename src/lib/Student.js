/**
 * Student object definition for the ECS Frontend application
 * This object represents a student with their basic information
 */
class Student {
  constructor(regNo, name, classID, barcode) {
    this.regNo = regNo;
    this.name = name;
    this.classID = classID;
    this.barcode = barcode;
  }

  /**
   * Get student registration number
   * @returns {string} Registration number
   */
  getRegNo() {
    return this.regNo;
  }

  /**
   * Get student name
   * @returns {string} Student name
   */
  getName() {
    return this.name;
  }

  /**
   * Get student class ID
   * @returns {string} Class ID
   */
  getClassID() {
    return this.classID;
  }

  /**
   * Get student barcode
   * @returns {string} Barcode
   */
  getBarcode() {
    return this.barcode;
  }

  /**
   * Update student registration number
   * @param {string} regNo - New registration number
   */
  setRegNo(regNo) {
    this.regNo = regNo;
  }

  /**
   * Update student name
   * @param {string} name - New student name
   */
  setName(name) {
    this.name = name;
  }

  /**
   * Update student class ID
   * @param {string} classID - New class ID
   */
  setClassID(classID) {
    this.classID = classID;
  }

  /**
   * Update student barcode
   * @param {string} barcode - New barcode
   */
  setBarcode(barcode) {
    this.barcode = barcode;
  }

  /**
   * Convert student object to JSON
   * @returns {Object} JSON representation of the student
   */
  toJSON() {
    return {
      regNo: this.regNo,
      name: this.name,
      classID: this.classID,
      barcode: this.barcode
    };
  }

  /**
   * Create a Student object from JSON data
   * @param {Object} jsonData - JSON data containing student information
   * @returns {Student} New Student instance
   */
  static fromJSON(jsonData) {
    return new Student(
      jsonData.regNo,
      jsonData.name,
      jsonData.classID,
      jsonData.barcode
    );
  }

  /**
   * Validate student data
   * @returns {boolean} True if all required fields are present and valid
   */
  isValid() {
    return (
      this.regNo && 
      this.name && 
      this.classID && 
      this.barcode &&
      typeof this.regNo === 'string' &&
      typeof this.name === 'string' &&
      typeof this.classID === 'string' &&
      typeof this.barcode === 'string'
    );
  }

  /**
   * Get a string representation of the student
   * @returns {string} String representation
   */
  toString() {
    return `Student(${this.regNo}): ${this.name} - Class: ${this.classID}`;
  }
}

export default Student;
