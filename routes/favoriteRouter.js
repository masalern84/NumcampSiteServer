const express = require("express");
const favoriteRouter = express.Router();
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("users", "campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          Favorite.create({ user: req.user._id })
            .then((favorite) => {
              req.body.forEach((favObj) => {
                if (!favorite.campsites.includes(favObj._id)) {
                  favorite.campsites.push(favObj._id);
                }
              });
              favorite
                .save()
                .then((response) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(response);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        } else {
          req.body.forEach((favObj) => {
            console.log("favorites object:", favObj);
            if (!favorite.campsites.includes(favObj._id)) {
              favorite.campsites.push(favObj._id);
            }
          });
          favorite
            .save()
            .then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (!favorite) {
        Favorite.create({
          user: req.user._id,
          campsites: [req.params.campsiteId],
        })
          .then((response) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          })
          .catch((err) => next(err));
      } else {
        console.log();
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId);
          favorite
            .save()
            .then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("Campsite already exist in Favorites");
        }
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((response) => {
        if (response) {
          const indexArray = response.campsites.indexOf(req.params.campsiteId);
          if (indexArray !== -1) {
            response.campsites.splice(indexArray, 1);
          }
          response
            .save()
            .then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("No Favorites exist to delete");
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
