import Email from "../models/format.js";

// GET /api/db  -> get all nodes/entries
export const getAllNodes = async (req, res) => {
  try {
    const nodes = await Email.find().sort({ registration_date: -1 });
    res.status(200).json(nodes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch nodes", error: error.message });
  }
};

// GET /api/db/:id -> get a single node by id
export const getNodeById = async (req, res) => {
  try {
    const node = await Email.findById(req.params.id);
    if (!node) return res.status(404).json({ message: "Node not found" });
    res.status(200).json(node);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch node", error: error.message });
  }
};

// POST /api/db -> create a new node manually (bypasses OpenRouter extraction)
export const createNode = async (req, res) => {
  try {
    const {
      company_name,
      registration_date,
      work_period,
      stiphend,
      location,
      company_website,
      status,
    } = req.body;

    if (!company_name || !registration_date) {
      return res
        .status(400)
        .json({ message: "company_name and registration_date are required" });
    }

    const node = new Email({
      company_name,
      registration_date,
      work_period,
      stiphend,
      location,
      company_website,
      status: status ?? false,
    });

    await node.save();
    res.status(201).json(node);
  } catch (error) {
    res.status(500).json({ message: "Failed to create node", error: error.message });
  }
};

// PUT /api/db/:id -> update an existing node
export const updateNode = async (req, res) => {
  try {
    const node = await Email.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!node) return res.status(404).json({ message: "Node not found" });
    res.status(200).json(node);
  } catch (error) {
    res.status(500).json({ message: "Failed to update node", error: error.message });
  }
};

// DELETE /api/db/:id -> delete a node
export const deleteNode = async (req, res) => {
  try {
    const node = await Email.findByIdAndDelete(req.params.id);
    if (!node) return res.status(404).json({ message: "Node not found" });
    res.status(200).json({ message: "Node deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete node", error: error.message });
  }
};