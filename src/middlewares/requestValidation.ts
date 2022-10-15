import { NextFunction, Request, Response } from "express";
import * as Joi from "joi";

export const validateRequest = {
  login: async function (req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }

    next();
  },

  registration: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().required().min(3),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }

    next();
  },

  refreshToken: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const schema = Joi.object({
      token: Joi.string().required(),
      refreshToken: Joi.string().required(),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }

    next();
  },

  deposit: async function (req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      userId: Joi.number(), // auto assigned on authorization
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }

    next();
  },

  transfer: async function (req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      userId: Joi.number(), // auto assigned on authorization
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
      beneficiary: Joi.string().email().required(),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }

    next();
  },

  withdrawal: async function (req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      userId: Joi.number(), // auto assigned on authorization
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
      accountName: Joi.string().required(),
      accountNumber: Joi.string().required().min(10).max(10),
      bank: Joi.string().required(),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }

    next();
  },
};
