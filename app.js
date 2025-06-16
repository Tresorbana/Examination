const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

class Student {
    constructor(name, grade) {
        this.name = name;
        this.grade = grade;
    }

    getDetails() {
        return `Name: ${this.name}, Grade: ${this.grade}`;
    }

    static fromJSON(json) {
        return new Student(json.name, json.grade);
    }
}

function readStudentsFile() {
    try {
        if (!fs.existsSync('students.json')) {
            const initialData = { students: [] };
            fs.writeFileSync('students.json', JSON.stringify(initialData, null, 2));
            return initialData;
        }

        const data = fs.readFileSync('students.json', 'utf8');
        const parsedData = JSON.parse(data);
        
        if (!parsedData || !Array.isArray(parsedData.students)) {
            const initialData = { students: [] };
            fs.writeFileSync('students.json', JSON.stringify(initialData, null, 2));
            return initialData;
        }
        
        return parsedData;
    } catch (error) {
        const initialData = { students: [] };
        fs.writeFileSync('students.json', JSON.stringify(initialData, null, 2));
        return initialData;
    }
}

function writeStudentsFile(data) {
    try {
        if (!data || !Array.isArray(data.students)) {
            return false;
        }
        fs.writeFileSync('students.json', JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

if (!fs.existsSync('students.json')) {
    writeStudentsFile({ students: [] });
}

app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/students', (req, res) => {
    try {
        const data = readStudentsFile();
        
        if (!data || !Array.isArray(data.students)) {
            throw new Error('Invalid data structure');
        }
        
        const studentDetails = data.students.map(studentData => {
            const student = Student.fromJSON(studentData);
            return student.getDetails();
        });
        
        res.json({ students: studentDetails });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/student', (req, res) => {
    try {
        const { name, grade } = req.body;
        
        if (!name || !grade) {
            return res.status(400).json({ error: 'Name and grade are required' });
        }

        const student = new Student(name, grade);
        const data = readStudentsFile();
        data.students.push(student);
        
        if (writeStudentsFile(data)) {
            res.status(201).json({ message: 'Student added successfully', student: student.getDetails() });
        } else {
            res.status(500).json({ error: 'Failed to save student data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000 and the ui ")
    if (!fs.existsSync('students.json')) {
        writeStudentsFile({ students: [] });
    }
}); 