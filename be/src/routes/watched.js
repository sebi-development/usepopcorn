import express from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

function serializeWatchedMovie(movie) {
  return {
    imdbID: movie.imdbID,
    title: movie.title,
    year: movie.year,
    poster: movie.poster,
    imdbRating: movie.imdbRating,
    runtime: movie.runtime,
    userRating: movie.userRating,
    isViewed: movie.isViewed,
  };
}

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const watchedMovies = await prisma.watchedMovie.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(watchedMovies.map(serializeWatchedMovie));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { imdbID, title, year, poster, imdbRating, runtime, userRating } = req.body;
  const imdbRatingNumber = Number(imdbRating);
  const runtimeNumber = Number(runtime);
  const userRatingNumber = Number(userRating);

  if (!imdbID || !title || !year || !poster || userRating === undefined) {
    return res.status(400).json({ error: 'Missing required movie fields' });
  }

  if (Number.isNaN(imdbRatingNumber) || Number.isNaN(runtimeNumber) || Number.isNaN(userRatingNumber)) {
    return res.status(400).json({ error: 'Invalid numeric movie fields' });
  }

  try {
    const watchedMovie = await prisma.watchedMovie.create({
      data: {
        userId: req.user.userId,
        imdbID,
        title,
        year,
        poster,
        imdbRating: imdbRatingNumber,
        runtime: runtimeNumber,
        userRating: userRatingNumber,
        isViewed: true,
      },
    });

    res.status(201).json(serializeWatchedMovie(watchedMovie));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Movie already exists in watched list' });
    }

    next(error);
  }
});

router.patch('/:imdbID', async (req, res, next) => {
  const data = {};

  if ('title' in req.body) data.title = req.body.title;
  if ('year' in req.body) data.year = req.body.year;
  if ('poster' in req.body) data.poster = req.body.poster;
  if ('imdbRating' in req.body) data.imdbRating = Number(req.body.imdbRating);
  if ('runtime' in req.body) data.runtime = Number(req.body.runtime);
  if ('userRating' in req.body) data.userRating = req.body.userRating === null ? null : Number(req.body.userRating);
  if ('isViewed' in req.body) data.isViewed = req.body.isViewed;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  if (
    Number.isNaN(data.imdbRating) ||
    Number.isNaN(data.runtime) ||
    Number.isNaN(data.userRating)
  ) {
    return res.status(400).json({ error: 'Invalid numeric movie fields' });
  }

  try {
    const watchedMovie = await prisma.watchedMovie.update({
      where: {
        userId_imdbID: {
          userId: req.user.userId,
          imdbID: req.params.imdbID,
        },
      },
      data,
    });

    res.json(serializeWatchedMovie(watchedMovie));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Movie not found' });
    }

    next(error);
  }
});

router.put('/:imdbID', async (req, res, next) => {
  const { userRating } = req.body;

  if (userRating === undefined) {
    return res.status(400).json({ error: 'Missing user rating' });
  }

  const userRatingNumber = Number(userRating);

  if (Number.isNaN(userRatingNumber) || userRatingNumber < 1 || userRatingNumber > 10) {
    return res.status(400).json({ error: 'Invalid user rating' });
  }

  try {
    const watchedMovie = await prisma.watchedMovie.update({
      where: {
        userId_imdbID: {
          userId: req.user.userId,
          imdbID: req.params.imdbID,
        },
      },
      data: { userRating: userRatingNumber },
    });

    res.status(200).json(serializeWatchedMovie(watchedMovie));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Movie not found' });
    }

    next(error);
  }
});

router.delete('/:imdbID', async (req, res, next) => {
  try {
    await prisma.watchedMovie.delete({
      where: {
        userId_imdbID: {
          userId: req.user.userId,
          imdbID: req.params.imdbID,
        },
      },
    });

    res.status(200).json({ imdbID: req.params.imdbID });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Movie not found' });
    }

    next(error);
  }
});

export default router;
