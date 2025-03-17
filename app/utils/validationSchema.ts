import * as Yup from "yup";
import {
  maxItemSearchLength,
  maxRecipeAuthorLength,
  maxRecipeDescriptionLength,
  maxRecipeNameLength,
  maxRecipePersons,
  maxRecipeTime,
  maxWeight,
  minPasswordLength,
  minRecipeAuthorLength,
  minRecipeDescriptionLength,
  minRecipeIngredients,
  minRecipeNameLength,
  minRecipePersons,
  minRecipeTime,
  minWeight,
  passwordSpecialChars,
} from "./validationVariables";

export const emailSchema = Yup.string()
  .email("Ugyldigt email-format")
  .required("Email er påkrævet");

export const passwordSchema = Yup.string()
  .required("Adgangskode er påkrævet")
  .min(
    minPasswordLength,
    `Adgangskoden skal være mindst ${minPasswordLength} tegn`
  )
  .matches(/[A-Z]/, "Adgangskoden skal indeholde mindst ét stort bogstav")
  .matches(/[a-z]/, "Adgangskoden skal indeholde mindst ét lille bogstav")
  .matches(/[0-9]/, "Adgangskoden skal indeholde mindst ét tal")
  .matches(
    passwordSpecialChars,
    "Adgangskoden skal indeholde mindst ét specialtegn"
  );

export const itemSearchSchema = Yup.string().max(
  maxItemSearchLength,
  `Vare kan maks være ${maxItemSearchLength} tegn`
);

export const weightSchema = Yup.number()
  .transform((value, originalValue) =>
    originalValue.trim() === "" ? null : Number(value)
  )
  .min(minWeight, `Må ikke være mindre end ${minWeight}`)
  .max(maxWeight, `Max ${maxWeight}`)
  .required("Vægt er påkrævet");

export const recipeNameSchema = Yup.string()
  .max(maxRecipeNameLength, `Navn kan maks være ${maxRecipeNameLength} tegn`)
  .min(minRecipeNameLength, `Navn skal være mindst ${minRecipeNameLength} tegn`)
  .required("Navn er påkrævet");

export const recipeImgSchema = Yup.string();

export const recipeTimeSchema = Yup.number()
  .transform((value, originalValue) =>
    originalValue.trim() === "" ? null : value
  )
  .min(minRecipeTime, `skal være mindst ${minRecipeTime}`)
  .max(maxRecipeTime, `kan ikke være mere end ${maxRecipeTime}`)
  .required("Tid er påkrævet");

export const recipeAuthorSchema = Yup.string()
  .max(
    maxRecipeAuthorLength,
    `Navn kan maks være ${maxRecipeAuthorLength} tegn`
  )
  .min(
    minRecipeAuthorLength,
    `Navn skal være på mindst ${minRecipeAuthorLength} bogstav`
  );

export const recipePersonAmountSchema = Yup.number()
  .transform((value, originalValue) =>
    originalValue.trim() === "" ? null : value
  )
  .min(minRecipePersons, `Må ikke være mindre end ${minRecipePersons}`)
  .max(maxRecipePersons, `Max ${maxRecipePersons}`)
  .required("Antal personer er påkrævet");

export const recipeDescriptionSchema = Yup.string()
  .max(maxRecipeDescriptionLength, `Max ${maxRecipeDescriptionLength} tegn`)
  .required("Beskrivelse er påkrævet")
  .min(
    minRecipeDescriptionLength,
    `Beskrivelse skal være mindst ${minRecipeDescriptionLength} tegn`
  );

// ---------------------------------------------------- //
// SCHEMAS //
// ---------------------------------------------------- //

export const loginSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
});

export const recipeSchema = Yup.object({
  recipeName: recipeNameSchema,
  image: recipeImgSchema.required("Billede er påkrævet"),
  time: recipeTimeSchema,
  recommendedPersonAmount: recipePersonAmountSchema,
  description: recipeDescriptionSchema,
  categories: Yup.array().of(Yup.string().required()).required("Kategorier er påkrævet"),
  ingredients: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required("Ingrediens er påkrævet"),
        weight: weightSchema,
        unit: Yup.string().required("Enhed er påkrævet")
      })
    )
    .required("Ingredienser er påkrævet")
    .min(
      minRecipeIngredients,
      `Opskriften skal indeholde mindst ${minRecipeIngredients} ingrediens`
    ),
});

export const addToShoppingListSchema = Yup.object({
  itemSearch: itemSearchSchema,
  weight: weightSchema,
});
