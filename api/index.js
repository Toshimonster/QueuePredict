const express = require("express");
const app = express()

const queueTimeRoutes = require("./routes/queueTime")


// Access Control
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept')

    if (req.method === 'OPTIONS') {
        res.header('Allow-Control-Allow-Methods', 'GET')
        
        return res.status(200).json({})
    }
    
    return next()
})

// Api
app.use("/api", queueTimeRoutes)

// Main files
app.use(express.static("base"))

// Error Handling

// 404 page
app.use((req, res, next) => {
    res.redirect("/404")
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

app.listen(80, () => {
    console.log("Server running on port 80")
})