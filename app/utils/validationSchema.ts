import * as Yup from "yup";
import { RECIPE_TYPES } from "../features/recipes/types/Recipe";
import {
  maxRecipeDescriptionLength,
  maxRecipeNameLength,
  maxRecipePersons,
  maxRecipeTime,
  maxWeight,
  minRecipeDescriptionLength,
  minRecipeItems,
  minRecipeNameLength,
  minRecipePersons,
  minRecipeTime,
  minWeight,
} from "./validationVariables";

const quantitySchema = Yup.number()
  .transform((value, originalValue) =>
    typeof originalValue === "string" && originalValue.trim() === ""
      ? null
      : Number(originalValue)
  )
  .min(minWeight, `Må ikke være mindre end ${minWeight}`)
  .max(maxWeight, `Max ${maxWeight}`)
  .required("Vægt er påkrævet");

const recipeNameSchema = Yup.string()
  .max(maxRecipeNameLength, `Navn kan maks være ${maxRecipeNameLength} tegn`)
  .min(minRecipeNameLength, `Navn skal være mindst ${minRecipeNameLength} tegn`)
  .required("Navn er påkrævet");

const recipeTimeSchema = Yup.number()
  .transform((value, originalValue) =>
    typeof originalValue === "string" && originalValue.trim() === ""
      ? null
      : Number(originalValue)
  )
  .min(minRecipeTime, `Skal være mindst ${minRecipeTime}`)
  .max(maxRecipeTime, `Kan ikke være mere end ${maxRecipeTime}`)
  .required("Tid er påkrævet");

const recipeAuthorSchema = Yup.string().default("");

const recipeImgSchema = Yup.string()
  .default("")
  .test(
    "is-url-or-empty",
    "Ugyldig billed-URL",
    // Uploaded images are stored as relative paths (/api/images/<id>).
    (value) =>
      !value || /^\/(?!\/)/.test(value) || Yup.string().url().isValidSync(value)
  );

const recipePersonAmountSchema = Yup.number()
  .transform((value, originalValue) =>
    typeof originalValue === "string" && originalValue.trim() === ""
      ? null
      : Number(originalValue)
  )
  .min(minRecipePersons, `Må ikke være mindre end ${minRecipePersons}`)
  .max(maxRecipePersons, `Max ${maxRecipePersons}`)
  .required("Antal personer er påkrævet");

const recipeDescriptionSchema = Yup.string()
  .max(maxRecipeDescriptionLength, `Max ${maxRecipeDescriptionLength} tegn`)
  .min(
    minRecipeDescriptionLength,
    `Beskrivelse skal være mindst ${minRecipeDescriptionLength} tegn`
  )
  .required("Beskrivelse er påkrævet");

// ---------------------------------------------------- //
// SCHEMAS //
// ---------------------------------------------------- //
const addIngredientSchema = Yup.object().shape({
  quantity: Yup.number()
    .min(1, "Mængden skal være mindst 1")
    .required("Mængde er påkrævet"),
  unit: Yup.string().required("Enhed er påkrævet"),
  category: Yup.string().required("Kategori er påkrævet"),
});

export const recipeSchema = Yup.object({
  _id: Yup.string().optional().nullable(),
  type: Yup.string().oneOf(RECIPE_TYPES).default("recipe"),
  sourceUrl: Yup.string()
    .default("")
    .test(
      "is-url-or-empty",
      "Ugyldig kilde-URL",
      (value) => !value || Yup.string().url().isValidSync(value)
    ),
  recipeName: Yup.string().when("sourceUrl", {
    is: (value: string | undefined) => !value,
    then: () => recipeNameSchema,
    otherwise: (schema) =>
      schema.max(maxRecipeNameLength, `Navn kan maks være ${maxRecipeNameLength} tegn`).default(""),
  }),
  image: recipeImgSchema,
  time: Yup.number().when("sourceUrl", {
    is: (value: string | undefined) => !value,
    then: () => recipeTimeSchema,
    otherwise: (schema) =>
      schema
        .transform((value, originalValue) =>
          typeof originalValue === "string" && originalValue.trim() === ""
            ? 0
            : Number(originalValue)
        )
        .min(0, "Skal være mindst 0")
        .max(maxRecipeTime, `Kan ikke være mere end ${maxRecipeTime}`)
        .default(0),
  }),
  recommendedPersonAmount: Yup.number().when("sourceUrl", {
    is: (value: string | undefined) => !value,
    then: () => recipePersonAmountSchema,
    otherwise: (schema) =>
      schema
        .transform((value, originalValue) =>
          typeof originalValue === "string" && originalValue.trim() === ""
            ? 0
            : Number(originalValue)
        )
        .min(0, "Må ikke være mindre end 0")
        .max(maxRecipePersons, `Max ${maxRecipePersons}`)
        .default(0),
  }),
  description: Yup.string().when("sourceUrl", {
    is: (value: string | undefined) => !value,
    then: () => recipeDescriptionSchema,
    otherwise: (schema) =>
      schema
        .max(maxRecipeDescriptionLength, `Max ${maxRecipeDescriptionLength} tegn`)
        .default(""),
  }),
  categories: Yup.array().of(Yup.string().required()).default([]),
  ingredients: Yup.array()
    .of(
      Yup.object({
        _id: Yup.string().default(""),
        item: Yup.object({
          _id: Yup.string().default(""),
          name: Yup.string().required(),
          category: Yup.string().required(),
          defaultUnit: Yup.string().required(),
        }).required(),
        quantity: quantitySchema,
        unit: Yup.string().required("Enhed er påkrævet"),
        marked: Yup.boolean().default(false),
        section: Yup.string().optional(),
      })
    )
    .when("sourceUrl", {
      is: (value: string | undefined) => !value,
      then: (schema) =>
        schema
          .required("Ingredienser er påkrævet")
          .min(
            minRecipeItems,
            `Opskriften skal indeholde mindst ${minRecipeItems} ingrediens`
          ),
      otherwise: (schema) => schema.default([]),
    }),
  author: recipeAuthorSchema,
});

