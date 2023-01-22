const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');

const Score = mongoose.model('Score', {
    hallticketNumber: String,
    studentName: String,
    code: String,
    subject: String,
    marks: String,
    grade: String,
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());


app.get('/aggregates', async (req, res) => {
const value = await getAggregates();
  res.render("aggregates", { value: value });
})

app.get('/test', async (req, res) => {
const value = await getAggregates();
  res.send(value);
});
app.get('/test2', async (req, res) => {
    const subject = req.query.subject;

 const value2= await Score.find({subject:subject})
  res.send(value2);
});

app.get("/viewStudents",async (req, res) => {
    const subject = req.query.subject;
    // make a query to get all rows in database whose subject is equal to `const subject`
    const value2= await Score.find({subject:subject})
    res.render("viewStudents", { subject: subject, value2: value2 });
    

});

mongoose.connect('mongodb://127.0.0.1:27017/scores', () => {
    console.log("database is connected");
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
});    

async function getAggregates() {
    const value = await Score.aggregate([
        {
            $project: {
                _id: 0,
                subject: 1,
                grade: 1.
            }
        },
        {
            $group: {
                _id: { subject: "$subject", grade: "$grade" },
                "count": { $sum: 1 }
            }
        }
    ]);
    const grouped = groupSubjects(value);
    return grouped.sort((a, b) => a.subject.localeCompare(b.subject));
}

function groupSubjects(value) {
    const map = new Map();
    for (let i = 0; i < value.length; i++) {
        const subject = value[i]._id.subject;
        const grade = value[i]._id.grade;
        const count = value[i].count;

        const subjectAggregate = map.get(subject) || {
            pass: 0,
            fail: 0,
            absent: 0,
            subject: subject,
        };

        if (grade === "PASS") {
            subjectAggregate.pass += count;
        } else if (grade === 'FAIL') {
            subjectAggregate.fail += count;
        } else if (grade === 'ABSENT') {
            subjectAggregate.absent += count;
        }

        map.set(subject, subjectAggregate);
    }

    return Array.from(map.values());
}