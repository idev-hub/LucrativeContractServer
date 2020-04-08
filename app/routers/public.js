const express = require("express");
const router = require("express").Router();

router.use(express.static('public'));

router.use((req, res) => {
    res.sendfile('./public/index.html')
});

module.exports = router;