import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

// GET ALL POSTS
app.get("/posts", async (req, res) => {
  try {
    const results = await connectionPool.query(`select * from assignments`);
    return res.status(200).json({
      data: results.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});
//GET POSTS by ID
app.get("/posts/:assignmentId", async (req, res) => {

  fetch('http://127.0.0.1:7664/ingest/bc125c62-9fc5-4bf0-8131-981f8b4df561',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85ca35'},body:JSON.stringify({sessionId:'85ca35',runId:'post-fix',hypothesisId:'A',location:'app.mjs:GET /posts/:id entry',message:'handler entered',data:{paramAssignmentId:req.params.assignmentId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    const assignmentIdfromClient = req.params.assignmentId;
    const results = await connectionPool.query(
      `select * from assignments 
      where assignment_id = $1`,
      [assignmentIdfromClient],
    );
    if (!results.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment",
      });
    }
    return res.status(200).json({
      data: results.rows[0],
    });
  } catch (error) {

    fetch('http://127.0.0.1:7664/ingest/bc125c62-9fc5-4bf0-8131-981f8b4df561',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'85ca35'},body:JSON.stringify({sessionId:'85ca35',runId:'post-fix',hypothesisId:'C',location:'app.mjs:catch',message:'caught error',data:{errorName:error?.name,errorMessage:error?.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

// GET USERS BY ID
app.get("/users/:usersID", async (req, res) => {
  try {
    const userIdfromClient = req.params.usersID;
    const results = await connectionPool.query(
      `select 
      user_id,
      firstname,
      lastname,
      created_at
      from users
      where user_id = $1`,
      [userIdfromClient],
    );
    if (!results.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      data: results.rows[0],
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read user because database connection",
    });
  }
});

// POST METHOD
app.post("/posts", async (req, res) => {
  try {
    const newAssignment = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: new Date(),
    };

    await connectionPool.query(
      `insert into assignments (title, content, category, created_at, updated_at, published_at)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ],
    );

    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

// PUT METHOD
app.put("/posts/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    const updatedAssignment = { ...req.body, updated_at: new Date() };

    const result = await connectionPool.query(
      `update assignments
       set title = $2, content = $3, category = $4, updated_at = $5
       where assignment_id = $1`,
      [
        assignmentIdFromClient,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }

    return res.status(200).json({
      message: "Updated assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

// DELETE MOTHOD
app.delete("/posts/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    const result = await connectionPool.query(
      `delete from assignments where assignment_id = $1`,
      [assignmentIdFromClient],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }

    return res.status(200).json({
      message: "Deleted assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
