import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

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
      ]
    );

    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Server could not create assignment because there are missing data from client",
    });
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});
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
      ]
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

app.delete("/posts/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    const result = await connectionPool.query(
      `delete from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
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
