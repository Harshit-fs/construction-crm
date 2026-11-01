import API_BASE_URL from "../apiConfig";

import  { useEffect, useState } from "react";
import axios from "axios";

function Documents() {

  const [documents, setDocuments] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [projects, setProjects] = useState([]);

  const [properties, setProperties] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(true);


  const [form, setForm] = useState({

    document_name: "",
    document_type: "",
    customer_id: "",
    project_id: "",
    property_id: "",
    description: "",
    status: "Active",
    file: null

  });


  // =====================================
  // FETCH DOCUMENTS
  // =====================================

  const fetchDocuments = async () => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/document/all`
      );

      setDocuments(response.data);

    } catch (error) {

      console.log(
        "FETCH DOCUMENTS ERROR:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================
  // FETCH CUSTOMERS
  // =====================================

  const fetchCustomers = async () => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/customer/all`
      );

      setCustomers(response.data);

    } catch (error) {

      console.log(
        "FETCH CUSTOMERS ERROR:",
        error
      );

    }
  };


  // =====================================
  // FETCH PROJECTS
  // =====================================

  const fetchProjects = async () => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/Project/all`
      );

      setProjects(response.data);

    } catch (error) {

      console.log(
        "FETCH PROJECTS ERROR:",
        error
      );

    }
  };


  // =====================================
  // FETCH PROPERTIES
  // =====================================

  const fetchProperties = async () => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/property/all`
      );

      setProperties(response.data);

    } catch (error) {

      console.log(
        "FETCH PROPERTIES ERROR:",
        error
      );

    }
  };


  // =====================================
  // USE EFFECT
  // =====================================

  useEffect(() => {

    fetchDocuments();

    fetchCustomers();

    fetchProjects();

    fetchProperties();

  }, []);


  // =====================================
  // HANDLE CHANGE
  // =====================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm({
      ...form,
      [name]: value
    });

  };


  // =====================================
  // FILE CHANGE
  // =====================================

  const handleFileChange = (e) => {

    setForm({
      ...form,
      file: e.target.files[0]
    });

  };


  // =====================================
  // RESET FORM
  // =====================================

  const resetForm = () => {

    setForm({

      document_name: "",
      document_type: "",
      customer_id: "",
      project_id: "",
      property_id: "",
      description: "",
      status: "Active",
      file: null

    });

    setEditId(null);

  };


  // =====================================
  // OPEN ADD FORM
  // =====================================

  const openAddForm = () => {

    resetForm();

    setShowForm(true);

  };


  // =====================================
  // EDIT
  // =====================================

  const handleEdit = (document) => {

    setEditId(document.id);

    setForm({

      document_name:
        document.document_name || "",

      document_type:
        document.document_type || "",

      customer_id:
        document.customer_id || "",

      project_id:
        document.project_id || "",

      property_id:
        document.property_id || "",

      description:
        document.description || "",

      status:
        document.status || "Active",

      file: null

    });

    setShowForm(true);

  };


  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (
      !form.document_name ||
      !form.document_type
    ) {

      alert(
        "Document name and type are required"
      );

      return;
    }


    const formData = new FormData();


    formData.append(
      "document_name",
      form.document_name
    );

    formData.append(
      "document_type",
      form.document_type
    );

    formData.append(
      "customer_id",
      form.customer_id
    );

    formData.append(
      "project_id",
      form.project_id
    );

    formData.append(
      "property_id",
      form.property_id
    );

    formData.append(
      "description",
      form.description
    );

    formData.append(
      "status",
      form.status
    );


    if (form.file) {

      formData.append(
        "file",
        form.file
      );

    }


    try {

      if (editId) {

        await axios.put(
          `${API_BASE_URL}/document/${editId}`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

        alert(
          "Document updated successfully"
        );

      } else {

        if (!form.file) {

          alert(
            "Please select a document file"
          );

          return;
        }


        await axios.post(
          `${API_BASE_URL}/document/add`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

        alert(
          "Document uploaded successfully"
        );

      }


      setShowForm(false);

      resetForm();

      fetchDocuments();


    } catch (error) {

      console.log(
        "SAVE DOCUMENT ERROR:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );

    }

  };


  // =====================================
  // DELETE
  // =====================================

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this document?"
      )
    ) {

      return;

    }


    try {

      await axios.delete(
        `${API_BASE_URL}/document/${id}`
      );


      alert(
        "Document deleted successfully"
      );


      fetchDocuments();


    } catch (error) {

      console.log(
        "DELETE DOCUMENT ERROR:",
        error
      );


      alert(
        "Error deleting document"
      );

    }

  };


  // =====================================
  // VIEW
  // =====================================

  const handleView = (document) => {

    if (!document.file_path) {

      alert(
        "File not available"
      );

      return;

    }


    window.open(
      `${API_BASE_URL}${document.file_path}`,
      "_blank"
    );

  };


  // =====================================
  // DOWNLOAD
  // =====================================

  const handleDownload = (document) => {

    if (!document.file_path) {

      alert(
        "File not available"
      );

      return;

    }


    const link =
      window.document.createElement("a");


    link.href =
      `${API_BASE_URL}${document.file_path}`;


    link.download =
      document.document_name;


    link.target = "_blank";


    link.click();

  };


  // =====================================
  // COUNTS
  // =====================================

  const totalDocuments =
    documents.length;


  const projectDocuments =
    documents.filter(
      (doc) => doc.project_id
    ).length;


  const customerDocuments =
    documents.filter(
      (doc) => doc.customer_id
    ).length;


  return (

    <>

      {/* ================================
          PAGE HEADER
      ================================= */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Documents
          </h1>

          <p className="page-subtitle">
            Manage customer, project, property and agreement documents.
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={openAddForm}
        >

          <i className="bi bi-cloud-arrow-up me-2"></i>

          Upload Document

        </button>

      </div>


      {/* ================================
          UPLOAD FORM
      ================================= */}

      {showForm && (

        <div className="card mb-4">

          <div className="card-header">

            <h5 className="card-title mb-0">

              {editId
                ? "Edit Document"
                : "Upload Document"}

            </h5>

          </div>


          <div className="card-body">

            <form onSubmit={handleSubmit}>

              <div className="row">


                {/* DOCUMENT NAME */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Document Name
                  </label>

                  <input
                    type="text"
                    name="document_name"
                    className="form-control"
                    placeholder="Example: Project Agreement"
                    value={
                      form.document_name
                    }
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* DOCUMENT TYPE */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Document Type
                  </label>

                  <select
                    name="document_type"
                    className="form-select"
                    value={
                      form.document_type
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Document Type
                    </option>

                    <option value="Agreement">
                      Agreement
                    </option>

                    <option value="Customer">
                      Customer
                    </option>

                    <option value="Project">
                      Project
                    </option>

                    <option value="Property">
                      Property
                    </option>

                    <option value="Payment">
                      Payment
                    </option>

                    <option value="ID Proof">
                      ID Proof
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* CUSTOMER */}

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Customer
                  </label>

                  <select
                    name="customer_id"
                    className="form-select"
                    value={
                      form.customer_id
                    }
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Customer
                    </option>

                    {customers.map(
                      (customer) => (

                        <option
                          key={customer.id}
                          value={customer.id}
                        >

                          {customer.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* PROJECT */}

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Project
                  </label>

                  <select
                    name="project_id"
                    className="form-select"
                    value={
                      form.project_id
                    }
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Project
                    </option>

                    {projects.map(
                      (project) => (

                        <option
                          key={project.id}
                          value={project.id}
                        >

                          {project.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* PROPERTY */}

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Property
                  </label>

                  <select
                    name="property_id"
                    className="form-select"
                    value={
                      form.property_id
                    }
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Property
                    </option>

                    {properties.map(
                      (property) => (

                        <option
                          key={property.id}
                          value={property.id}
                        >

                          {property.unit_number ||
                            `Property #${property.id}`}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* FILE */}

                <div className="col-md-8 mb-3">

                  <label className="form-label">
                    Select Document
                  </label>

                  <input
                    type="file"
                    className="form-control"
                    onChange={
                      handleFileChange
                    }
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />

                  <small className="text-muted">
                    PDF, JPG, PNG, DOC, DOCX
                  </small>

                </div>


                {/* STATUS */}

                <div className="col-md-4 mb-3">

                  <label className="form-label">
                    Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={
                      form.status
                    }
                    onChange={handleChange}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Archived">
                      Archived
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}

                <div className="col-12 mb-3">

                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="Enter document description"
                    value={
                      form.description
                    }
                    onChange={handleChange}
                  />

                </div>


                {/* BUTTONS */}

                <div className="col-12">

                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                  >

                    <i className="bi bi-cloud-upload me-2"></i>

                    {editId
                      ? "Update Document"
                      : "Upload Document"}

                  </button>


                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {

                      setShowForm(false);

                      resetForm();

                    }}
                  >

                    Cancel

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================================
          SUMMARY
      ================================= */}

      <div className="row g-4 mb-4">


        <div className="col-md-4">

          <div className="card card-stat">

            <div className="stat-label">
              Total Documents
            </div>

            <div className="stat-value">
              {totalDocuments}
            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card card-stat">

            <div className="stat-label">
              Project Documents
            </div>

            <div className="stat-value">
              {projectDocuments}
            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card card-stat">

            <div className="stat-label">
              Customer Documents
            </div>

            <div className="stat-value">
              {customerDocuments}
            </div>

          </div>

        </div>

      </div>


      {/* ================================
          TABLE
      ================================= */}

      <div className="card">

        <div className="card-header">

          <div>

            <h5 className="card-title mb-1">
              All Documents
            </h5>

            <span className="text-muted">
              Upload, view, download and manage business documents
            </span>

          </div>

        </div>


        <div className="card-body">

          <div className="table-responsive">

            <table className="table align-middle">

              <thead>

                <tr>

                  <th>#</th>

                  <th>
                    Document Name
                  </th>

                  <th>
                    Document Type
                  </th>

                  <th>
                    Related To
                  </th>

                  <th>
                    Reference
                  </th>

                  <th>
                    Uploaded Date
                  </th>

                  <th>
                    Uploaded By
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>


                {loading ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="text-center"
                    >

                      Loading documents...

                    </td>

                  </tr>

                ) : documents.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="text-center text-muted"
                    >

                      No documents found.

                    </td>

                  </tr>

                ) : (

                  documents.map(
                    (document, index) => (

                      <tr
                        key={document.id}
                      >


                        <td>
                          {index + 1}
                        </td>


                        <td>

                          <div className="d-flex align-items-center">

                            <i className="bi bi-file-earmark-text-fill text-primary fs-5 me-2"></i>

                            <strong>
                              {document.document_name}
                            </strong>

                          </div>

                        </td>


                        <td>
                          {document.document_type}
                        </td>


                        <td>

                          {document.project_name
                            ? "Project"
                            : document.property_id
                            ? "Property / Unit"
                            : document.customer_name
                            ? "Customer"
                            : "-"}

                        </td>


                        <td>

                          {document.project_name ||
                            document.property_unit ||
                            document.customer_name ||
                            "-"}

                        </td>


                        <td>

                          {document.created_at
                            ? new Date(
                                document.created_at
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                }
                              )
                            : "-"}

                        </td>


                        <td>
                          Administrator
                        </td>


                        
                        <td>
                          <div className="d-flex align-items-center gap-2">

                            {/* View */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="View Document"
                              onClick={() => handleView(document)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            {/* Download */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              title="Download Document"
                              onClick={() => handleDownload(document)}
                            >
                              <i className="bi bi-download"></i>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              title="Edit Document"
                              onClick={() => handleEdit(document)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Document"
                              onClick={() => handleDelete(document.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>
                        </td>



                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </>

  );
}

export default Documents;

