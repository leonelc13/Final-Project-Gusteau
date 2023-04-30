const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

// Route 1: GET /all_ingredients/:<ingredients>?page=<>&page_size=<>&max_prep_time=<> -- DONE
const all_ingredients = async function (req, res) {
  const ingredient_list = req.params.ingredients.split('&');
  const max_prep_time = req.query.max_prep_time ? parseInt(req.query.max_prep_time) : 200000;

  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;
  let query = "";
  if (!page) {
    if (ingredient_list.length == 1) {
      query += `WITH combined_recipes AS 
        (SELECT Recipe_id 
        FROM Recipe_Ingredient
        WHERE Ingredient_id IN
          (SELECT Ingredient_id
          FROM Ingredients
          WHERE Ingredient_name LIKE '%${ingredient_list[0]}%'))
        
          SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN Reviews r2 ON c.Recipe_id = r2.Recipe_id
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating)`;

    } else if (ingredient_list.length > 1) {
      query += "WITH ";
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `recipes${i} AS
                    (SELECT Recipe_id 
                    FROM Recipe_Ingredient
                    WHERE Ingredient_id IN
                      (SELECT Ingredient_id
                      FROM Ingredients
                      WHERE Ingredient_name LIKE '%${ingredient_list[i]}%')), 
                  `;
      }

      query += `combined_recipes AS (
                  SELECT recipes0.Recipe_id
                  FROM recipes0 `;

      for (let i = 1; i < ingredient_list.length; i++) {
        query += `INNER JOIN recipes${i} 
                  ON recipes${i - 1}.Recipe_id = recipes${i}.Recipe_id `;

        if (i === ingredient_list.length - 1) {
          query += `), \n`;
        }
      }

      query += `ratings AS (SELECT Recipe_id, rating FROM Reviews) `

      query += `SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN ratings r2 ON c.Recipe_id = r2.Recipe_id
          WHERE r1.num_ingredients >= ${ingredient_list.length} AND r1.preparation_time <= ${max_prep_time} 
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating) `
    }
    console.log(query);
    connection.query(query, (err, data) => {
      if (query === '' || err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    if (ingredient_list.length == 1) {
      query += `WITH combined_recipes AS 
        (SELECT Recipe_id 
        FROM Recipe_Ingredient
        WHERE Ingredient_id IN
          (SELECT Ingredient_id
          FROM Ingredients
          WHERE Ingredient_name LIKE '%${ingredient_list[0]}%'))
        
          SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN Reviews r2 ON c.Recipe_id = r2.Recipe_id
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating) 
          LIMIT ${pageSize} `;

    } else if (ingredient_list.length > 1) {
      query += "WITH ";
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `recipes${i} AS
                    (SELECT Recipe_id 
                    FROM Recipe_Ingredient
                    WHERE Ingredient_id IN
                      (SELECT Ingredient_id
                      FROM Ingredients
                      WHERE Ingredient_name LIKE '%${ingredient_list[i]}%')), 
                  `;
      }

      query += `combined_recipes AS (
                  SELECT recipes0.Recipe_id
                  FROM recipes0 `;

      for (let i = 1; i < ingredient_list.length; i++) {
        query += `INNER JOIN recipes${i} 
                  ON recipes${i - 1}.Recipe_id = recipes${i}.Recipe_id `;

        if (i === ingredient_list.length - 1) {
          query += `) \n`;
        }
      }

      query += `SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN Reviews r2 ON c.Recipe_id = r2.Recipe_id
          WHERE r1.num_ingredients >= ${ingredient_list.length} AND r1.preparation_time <= ${max_prep_time} 
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating)
          LIMIT ${pageSize} `
    }
    if (page > 1) {
      query += `OFFSET ${(page - 1) * pageSize}`;
    }

    connection.query(query, (err, data) => {
      if (query === '' || err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}


// Route 2: GET /contributor/:contributor_id -- DONE
const contributor = async function (req, res) {
  let cid = req.params.contributor_id;
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;
  if (!page) {
    connection.query(`
    SELECT * 
    FROM Recipes 
    WHERE contributor_id IN
    (SELECT contributor_id
    FROM Recipes
    WHERE contributor_id = '${cid}');`,
      (err, data) => {
        if (err || data.length === 0) {
          console.log(err);
          res.json({});
        } else {
          res.json(data);
        }
      });
  } else {
    let queryString = `
    SELECT * 
    FROM Recipes 
    WHERE contributor_id IN
    (SELECT contributor_id
    FROM Recipes
    WHERE contributor_id = '${cid}')
    LIMIT ${pageSize};`
    if (page > 1) {
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }
    connection.query(queryString, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 3: GET /prep_time?low_prep_time=&high_prep_time=
const prep_time = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  let minPrep = req.query.min_prep_time;
  let maxPrep = req.query.max_prep_time;
  if (!req.params.min_prep_time) {
    minPrep = 0;
  }

  if (!req.params.max_prep_time) {
    maxPrep = 0;
  }
  if (!page) {
    connection.query(`
    WITH recipe_ids AS (
      SELECT r.id, r.preparation_time, AVG(rv.rating) AS avg_rating
      FROM Recipes r
      INNER JOIN Reviews rv ON r.id = rv.Recipe_id
      WHERE r.preparation_time BETWEEN ${minPrep} AND ${maxPrep}
      GROUP BY r.id, r.preparation_time
    )
    SELECT id, preparation_time, avg_rating
    FROM recipe_ids
    ORDER BY avg_rating DESC;
    '
  `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    let queryString = `
      WITH recipe_ids AS (
        SELECT r.id, r.preparation_time, AVG(rv.rating) AS avg_rating
        FROM Recipes r
        INNER JOIN Reviews rv ON r.id = rv.Recipe_id
        WHERE r.preparation_time BETWEEN ${minPrep} AND ${maxPrep}
        GROUP BY r.id, r.preparation_time
      )
      SELECT id, preparation_time, avg_rating
      FROM recipe_ids
      ORDER BY avg_rating DESC;
      LIMIT ${pageSize}`;
    if (page > 1) {
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }
    connection.query(queryString, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 4: GET /min_rating?rating
const min_rating = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  let rating = req.query.rating;
  if (!rating) {
    rating = 0;
  }

  if (!page) {
    connection.query(`
      WITH recipe_ratings AS (
        SELECT r.name, AVG(rev.rating) as avg_rating, COUNT(rev.recipe_id) as num_reviews, r.id
        FROM Recipes r
        JOIN Reviews rev ON r.id = rev.recipe_id
        GROUP BY r.id
        HAVING COUNT(rev.recipe_id) > 3
      )

      SELECT R.id, R.preparation_time, R.calories, rv.avg_rating
      FROM Recipes R
      JOIN recipe_ratings rv ON R.id = rv.id
      WHERE rv.avg_rating >= ${rating}
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    let queryString = `
      WITH recipe_ratings AS (
        SELECT r.name, AVG(rev.rating) as avg_rating, COUNT(rev.recipe_id) as num_reviews, r.id
        FROM Recipes r
        JOIN Reviews rev ON r.id = rev.recipe_id
        GROUP BY r.id
        HAVING COUNT(rev.recipe_id) > 3
      )
      
      SELECT R.id, R.preparation_time, R.calories, rv.avg_rating
      FROM Recipes R
      JOIN recipe_ratings rv ON R.id = rv.id
      WHERE rv.avg_rating >= ${rating}
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }
    connection.query(queryString, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 5: GET /similar_recipes/:recipe_name 
const similar_recipes = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10; s
  const recipeName = req.params.recipe_name;

  if (!page) {
    connection.query(`
      SELECT * FROM Recipes
      WHERE name LIKE '${recipeName}'
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    let queryString = `
      SELECT * FROM Recipes
      WHERE name LIKE '${recipeName}'
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }
    connection.query(queryString, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}


// Route 7: GET /some_ingredients/:<ingredients>?max_prep_time=<> -- DONE
const some_ingredients = async function (req, res) {
  console.log(req.url);
  const ingredient_list = req.params.ingredients.split('&');
  const max_prep_time = req.query.max_prep_time ? parseInt(req.query.max_prep_time) : 200000;

  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;
  let query = "";
  if (!page) {
    if (ingredient_list.length >= 1) {
      query += "WITH ";
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `recipes${i} AS
                    (SELECT Recipe_id 
                    FROM Recipe_Ingredient
                    WHERE Ingredient_id IN
                      (SELECT Ingredient_id
                      FROM Ingredients
                      WHERE Ingredient_name LIKE '%${ingredient_list[i]}%')), 
                  `;
      }

      query += `all_recipe_ids AS (`;
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `SELECT Recipe_id FROM recipes${i} `;
        if (i !== ingredient_list.length - 1) {
          query += "UNION ALL\n"
        }
      }
      query += `),\n`;


      query += `all_recipes AS (
        SELECT a.*, COUNT(Recipe_id) AS num_matches
        FROM all_recipe_ids a
        GROUP BY Recipe_id
      )`;

      query += `SELECT r.* 
        FROM all_recipes a 
        JOIN Recipes r ON a.Recipe_id = r.id
        WHERE r.preparation_time <= ${max_prep_time}
        ORDER BY a.num_matches`;
    }

    connection.query(query, (err, data) => {
      if (err || data.length === 0 || query === "") {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    if (ingredient_list.length >= 1) {
      query += "WITH ";
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `recipes${i} AS
                    (SELECT Recipe_id 
                    FROM Recipe_Ingredient
                    WHERE Ingredient_id IN
                      (SELECT Ingredient_id
                      FROM Ingredients
                      WHERE Ingredient_name LIKE '%${ingredient_list[i]}%')), 
                  `;
      }

      query += `all_recipe_ids AS (`;
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `SELECT Recipe_id FROM recipes${i} `;
        if (i !== ingredient_list.length - 1) {
          query += "UNION ALL\n"
        }
      }
      query += `),\n`;


      query += `all_recipes AS (
        SELECT a.*, COUNT(Recipe_id) AS num_matches
        FROM all_recipe_ids a
        GROUP BY Recipe_id
      )`;

      query += `SELECT r.* 
        FROM all_recipes a 
        JOIN Recipes r ON a.Recipe_id = r.id
        WHERE r.preparation_time <= ${max_prep_time}
        ORDER BY a.num_matches
        LIMIT ${pageSize} `;
    }

    if (page > 1) {
      query += `OFFSET ${(page - 1) * pageSize}`;
    }

    connection.query(query, (err, data) => {
      if (err || data.length === 0 || query === "") {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
};

// Route 8: GET /worst_recipes -- DONE
const worst_recipes = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      SELECT r.name, AVG(rev.rating) as avg_rating, COUNT(rev.recipe_id) as num_reviews, r.id, r.steps, r.calories, rev.description, r.num_ingredients, r.contributor_id
      FROM Recipes r
      JOIN Reviews rev ON r.id = rev.recipe_id
      GROUP BY r.id
      HAVING COUNT(rev.recipe_id) > 2
      ORDER BY avg_rating ASC, num_reviews DESC
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    let queryString = `
      SELECT r.name, AVG(rev.rating) as avg_rating, COUNT(rev.recipe_id) as num_reviews, r.id, r.steps, r.calories, rev.description, r.num_ingredients, r.contributor_id
      FROM Recipes r
      JOIN Reviews rev ON r.id = rev.recipe_id
      GROUP BY r.id
      HAVING COUNT(rev.recipe_id) > 2
      ORDER BY avg_rating ASC, num_reviews DESC
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }
    connection.query(queryString, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 9: GET /top_recipes/:contributor_id 
const top_recipes_contributor = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;
  let cid = req.params.contributor_id;

  if (!page) {
    connection.query(`
      SELECT R.id, R.name, R.steps, R.calories, R.preparation_time, R.contributor_id, R.num_ingredients, rev.description, AVG(rev.rating) as average_rating, COUNT(*) AS num_ratings
      FROM Reviews rev RIGHT JOIN Recipes R on rev.Recipe_id = R.id
      WHERE R.id IN (SELECT rec.id FROM Recipes rec WHERE rec.contributor_id = '${cid}')
      GROUP BY R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients
      ORDER BY average_rating DESC, num_ratings DESC
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        data.forEach(function (d) {
          if (d['average_rating'] === null) {
            d['num_ratings'] = 0;
          }
        });
        res.json(data);
      }
    });

  } else {
    let queryString = `
    SELECT R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients, rev.description, AVG(rev.rating) as average_rating, COUNT(*) AS num_ratings
      FROM Reviews rev RIGHT JOIN Recipes R on rev.Recipe_id = R.id
      WHERE R.id IN (SELECT rec.id FROM Recipes rec WHERE rec.contributor_id = '${cid}')
      GROUP BY R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients
      ORDER BY average_rating DESC, num_ratings DESC
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }
    connection.query(queryString, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        data.forEach(function (d) {
          if (d['average_rating'] === null) {
            d['num_ratings'] = 0;
          }
        });
        res.json(data);
      }
    });
  }
}

// Route 10: GET /top_recipes -- DONE
const top_recipes = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
    SELECT R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients, AVG(Rv.rating) AS avg_rating, COUNT(*) AS num_ratings
    FROM Recipes R JOIN Reviews Rv ON R.id = Rv.Recipe_id
    GROUP BY R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients
    HAVING COUNT(R.id.recipe_id) > 3
    ORDER BY avg_rating DESC
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    let queryString = `
    SELECT R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients, AVG(Rv.rating) AS avg_rating, COUNT(*) AS num_ratings
    FROM Recipes R JOIN Reviews Rv ON R.id = Rv.Recipe_id
    GROUP BY R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients
    HAVING num_ratings >= 10
    ORDER BY avg_rating DESC
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }
    connection.query(queryString, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 11: GET /random -- DONE
const random = async function (req, res) {
  connection.query(`
  SELECT R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients, AVG(Rv.rating) AS avg_rating
  FROM Recipes R JOIN Reviews Rv ON R.id = Rv.Recipe_id
  GROUP BY R.id, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients
  HAVING avg_rating >= 4
  ORDER BY RAND()
  LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 12: GET /recipe/:recipe_id -- DONE
const recipe = async function (req, res) {
  let rid = req.params.recipe_id;
  let queryString = `
    SELECT *
    FROM Recipes
    WHERE id = '${rid}'
  `;
  connection.query(queryString, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

//Route 13: GET /price/:recipe_id -- DONE
const rec_price = async function (req, res) {
  let rid = req.params.recipe_id;
  let queryString = `
  WITH joined_recipe_and_ingredients AS (
    SELECT ri.Ingredient_id, ri.Recipe_id
    FROM Recipes rec JOIN Recipe_Ingredient ri on rec.id = ri.Recipe_id
    WHERE rec.id = '${rid}'
  )
  SELECT jri.Ingredient_id, p.Ingredient_name, p.unit, p.country, AVG(p.price) AS avg_price
  FROM joined_recipe_and_ingredients jri JOIN Prices p ON jri.Ingredient_id = p.Ingredient_id
  GROUP BY Ingredient_id, Ingredient_name, p.unit
  `;
  connection.query(queryString, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 14: GET /recipes -- DONE
const recipes = async function (req, res) {
  connection.query(`
  SELECT DISTINCT name as label, id as id
    FROM Recipes
    ORDER BY id
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 15: GET /recipe_reviews/:recipe_id -- DONE
const recipe_reviews = async function (req, res) {
  let rid = req.params.recipe_id;
  let queryString = `
    SELECT user_id, description, rating
    FROM Reviews
    WHERE Recipe_id = '${rid}'
  `;
  connection.query(queryString, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// Route 16: GET /ingredients -- DONE
const ingredients = async function (req, res) {
  let queryString = `
    SELECT Ingredient_name as label, Ingredient_id as id
    FROM Ingredients
  `;
  connection.query(queryString, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}


module.exports = {
  all_ingredients,
  contributor,
  prep_time,
  min_rating,
  similar_recipes,
  some_ingredients,
  worst_recipes,
  top_recipes_contributor,
  top_recipes,
  random,
  recipe,
  rec_price,
  recipes,
  recipe_reviews,
  ingredients
}
