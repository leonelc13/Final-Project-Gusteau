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

// Route 1: GET /all_ingredients/:<ingredients>

const all_ingredients = async function (req, res) {
  const ingredient_list = req.query.ingredient_list;
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;
  let query = ""
  if (!page) {
    if (ingredient_list.length === 0) {
      query += `SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
        FROM Recipes r1
        LEFT JOIN Reviews r2 ON r1.Recipe_id = r2.Recipe_id
        GROUP BY r1.id
        ORDER BY AVG(r2.rating), COUNT(r2.rating)`;
    } else if (ingredient_list.length == 1) {
      query += `WITH combined_recipes} AS 
        (SELECT Recipe_id 
        FROM Recipe_Ingredient
        WHERE Ingredient_id IN
          (SELECT Ingredient_id
          FROM Ingredients
          WHERE Ingredient_name LIKE '%${ingredient_list[0]}%))
        
          SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN Reviews r2 ON c.Recipe_id = r2.Recipe_id
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating)`;

    } else {
      query += "WITH";
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `recipes${i} AS
                    (SELECT Recipe_id 
                    FROM Recipe_Ingredient
                    WHERE Ingredient_id IN
                      (SELECT Ingredient_id
                      FROM Ingredients
                      WHERE Ingredient_name LIKE '%${ingredient_list[i]}%)),
                  `;
      }

      query += `combined_recipes AS (
                  SELECT recipes1.Recipe_id
                  FROM recipes1`;

      for (let i = 1; i < ingredient_list.length; i++) {
        query += `INNER JOIN recipes${i} 
                  ON recipes${i - 1}.Recipe_id = recipes${i}.Recipe_id)`;
      }

      query += `SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN Reviews r2 ON c.Recipe_id = r2.Recipe_id
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating)`
    }

    connection.query(query, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    if (ingredient_list.length === 0) {
      query += `SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
        FROM Recipes r1
        LEFT JOIN Reviews r2 ON r1.Recipe_id = r2.Recipe_id
        GROUP BY r1.id
        ORDER BY AVG(r2.rating), COUNT(r2.rating)
        LIMIT ${pageSize}`;
    } else if (ingredient_list.length == 1) {
      query += `WITH combined_recipes} AS 
        (SELECT Recipe_id 
        FROM Recipe_Ingredient
        WHERE Ingredient_id IN
          (SELECT Ingredient_id
          FROM Ingredients
          WHERE Ingredient_name LIKE '%${ingredient_list[0]}%))
        
          SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN Reviews r2 ON c.Recipe_id = r2.Recipe_id
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating)
          LIMIT ${pageSize}`;

    } else {
      query += "WITH";
      for (let i = 0; i < ingredient_list.length; i++) {
        query += `recipes${i} AS
                    (SELECT Recipe_id 
                    FROM Recipe_Ingredient
                    WHERE Ingredient_id IN
                      (SELECT Ingredient_id
                      FROM Ingredients
                      WHERE Ingredient_name LIKE '%${ingredient_list[i]}%)),
                  `;
      }

      query += `combined_recipes AS (
                  SELECT recipes1.Recipe_id
                  FROM recipes1`;

      for (let i = 1; i < ingredient_list.length; i++) {
        query += `INNER JOIN recipes${i} 
                  ON recipes${i - 1}.Recipe_id = recipes${i}.Recipe_id)`;
      }

      query += `SELECT r1.*, AVG(r2.rating) AS avg_rating, COUNT(r2.rating) AS num_reviews
          FROM combined_recipes c
          JOIN Recipes r1 ON c.Recipe_id = r1.id
          LEFT JOIN Reviews r2 ON c.Recipe_id = r2.Recipe_id
          GROUP BY r1.id
          ORDER BY AVG(r2.rating), COUNT(r2.rating)
          LIMIT ${pageSize};`
    }
    if (page > 1) {
      console.log((page - 1) * pageSize);
      queryString += `OFFSET ${(page - 1) * pageSize}`;
    }

    connection.query(query, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}


// Route 2: GET /contributor/:contributor_id

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
    WHERE id = ${cid});`,
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
    WHERE id = ${cid})
    LIMIT ${pageSize};`
    if (page > 1) {
      console.log((page - 1) * pageSize);
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
      console.log((page - 1) * pageSize);
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
// Route 5: GET /similar_recipes/:recipe_name 
// Route 6: GET /recipes?
// Route 7: GET /some_ingredients/:<ingredients>

// Route 8: GET /worst_recipes
const worst_recipes = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      SELECT r.name, AVG(revrating) as avg_rating, COUNT(rev.recipe_id) as num_reviews
      FROM Recipes r
      JOIN Reviews rev ON r.id = rev.recipe_id
      WHERE rev.rating <= 1
      GROUP BY r.name
      HAVING COUNT(rev.recipe_id) > 10
      ORDER BY num_reviews DESC
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
      SELECT r.name, AVG(revrating) as avg_rating, COUNT(rev.recipe_id) as num_reviews
      FROM Recipes r
      JOIN Reviews rev ON r.id = rev.recipe_id
      WHERE rev.rating <= 1
      GROUP BY r.name
      HAVING COUNT(rev.recipe_id) > 10
      ORDER BY num_reviews DESC
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      console.log((page - 1) * pageSize);
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
const top_recipes_contrbutor = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;
  let cid = req.params.contributor_id;

  if (!page) {
    connection.query(`
      SELECT rev.Recipe_id, rev.description, AVG(rev.rating) as average_rating, COUNT(*) as num_ratings
      FROM Reviews rev
      WHERE rev.Recipe_id IN (SELECT rec.id FROM Recipes rec WHERE rec.contributor_id = ${cid})
      GROUP BY (Recipe_id)
      ORDER BY average_rating DESC, num_ratings DESC
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
      SELECT rev.Recipe_id, rev.description, AVG(rev.rating) as average_rating, COUNT(*) as num_ratings
      FROM Reviews rev
      WHERE rev.Recipe_id IN (SELECT rec.id FROM Recipes rec WHERE rec.contributor_id = ${cid})
      GROUP BY (Recipe_id)
      ORDER BY average_rating DESC, num_ratings DESC
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      console.log((page - 1) * pageSize);
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

// Route 10: GET /top_recipes
const top_recipes = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      SELECT R.rid, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients, Rv.rating
      FROM Recipes R JOIN Reviews Rv ON R.id = Rv.Recipe_id
      WHERE Rv.rating = 5
      ORDER BY R.name
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
      SELECT R.rid, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients, Rv.rating
      FROM Recipes R JOIN Reviews Rv ON R.id = Rv.Recipe_id
      WHERE Rv.rating = 5
      ORDER BY R.name
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      console.log((page - 1) * pageSize);
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

// Route 11: GET /random
const random = async function (req, res) {
  connection.query(`
    SELECT R.rid, R.name, R.steps, R.calories, R.contributor_id, R.num_ingredients, Rv.rating
    FROM Recipes R JOIN Reviews Rv ON R.id = Rv.Recipe_id
    WHERE Rv.rating >= 4
    ORDER BY RAND()
    LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json({
        rid: data[0].id,
        name: data[0].name,
        steps: data[0].steps,
        calories: data[0].calories,
        contributor_id: data[0].contributor_id,
        num_ingredients: data[0].num_ingredients,
        rating: data[0].rating
      });
    }
  });
}
// Route 12: GET /recipe/:recipe_id
const recipe = async function (req, res) {
  let rid = req.query.rid;
  let queryString = `
    SELECT *
    FROM recipes
    WHERE rid = ${rid}
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


//TODO: update module.exports



/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_songs
const top_songs = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      SELECT s.song_id, s.title AS title, s.album_id, a.title AS album, s.plays
      FROM Songs s
      JOIN Albums a ON
      s.album_id = a.album_id
      ORDER BY plays DESC
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
      SELECT s.song_id, s.title AS title, s.album_id, a.title AS album, s.plays
      FROM Songs s
      JOIN Albums a ON
      s.album_id = a.album_id
      ORDER BY plays DESC
      LIMIT ${pageSize}
    `;

    if (page > 1) {
      console.log((page - 1) * pageSize);
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


// Route 9: GET /top_prices/:contributor
const top_prices = async function (req, res) {
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;
  const playsLow = req.query.plays_low ?? 0;
  const playsHigh = req.query.plays_high ?? 1100000000;
  const danceabilityLow = req.query.danceability_low ?? 0;
  const danceabilityHigh = req.query.danceability_high ?? 1;
  const energyLow = req.query.energy_low ?? 0;
  const energyHigh = req.query.energy_high ?? 1;
  const valenceLow = req.query.valence_low ?? 0;
  const valenceHigh = req.query.valence_high ?? 1;
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  connection.query(`
    SELECT * FROM Songs
    WHERE title LIKE '%${title}%' AND
      duration <= ${durationHigh} AND duration >= ${durationLow} AND
      plays <= ${playsHigh} AND plays >= ${playsLow} AND
      danceability <= ${danceabilityHigh} AND danceability >= ${danceabilityLow} AND
      energy <= ${energyHigh} AND energy >= ${energyLow} AND
      valence <= ${valenceHigh} AND valence >= ${valenceLow} AND
      explicit <= ${explicit}
    ORDER BY title
  `, (err, data) => {
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
  recipes,
  some_ingredients,
  worst_recipes,
  top_recipes_contrbutor,
  top_recipes,
  random,
  recipe
}
