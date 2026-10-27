export async function fetchRecipes(signal) {
  const response = await fetch("https://dummyjson.com/recipes?limit=0", { signal });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las recetas (${response.status}).`);
  }

  const data = await response.json();
  if (!Array.isArray(data.recipes)) {
    throw new Error("La respuesta de recetas no tiene el formato esperado.");
  }

  return data.recipes;
}

async function sendRecipeRequest(url, method, recipe) {
  const response = await fetch(`https://dummyjson.com/recipes${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    throw new Error(`No se pudo ${method === "POST" ? "agregar" : method === "PUT" ? "actualizar" : "eliminar"} la receta (${response.status}).`);
  }

  return response.json();
}

export function createRecipe(recipe) {
  return sendRecipeRequest("/add", "POST", recipe);
}

export function updateRecipe(id, recipe) {
  return sendRecipeRequest(`/${id}`, "PUT", recipe);
}

export function deleteRecipe(id) {
  return sendRecipeRequest(`/${id}`, "DELETE");
}
