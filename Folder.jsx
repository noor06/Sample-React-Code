import React, { Component } from "react";
import { connect } from "react-redux";
import { getFolder, addEditFolder, deleteFolder } from "../../actions/folder";
import { toaster } from "../../helper/Toaster";
import { ModalPopup } from "../../helper/ModalPopup";

let addFlag = false;
let editFlag = false;
let deleteFlag = false;
export class Folder extends Component {
  constructor(props) {
    super(props);
    let storageData = localStorage.getItem("active_user_data")
      ? JSON.parse(localStorage.getItem("active_user_data"))
      : {};
    this.state = {
      name: "",
      description: "",
      image: "",
      folder_id: "",
      folders: [],
      filtered_folders: [],
      role: storageData && storageData.role,
      user_id: storageData && storageData.login_user_id,
      addEditFunc: "",
      deletFunc: false,
      toggleFlag: true,
      folder_owner: "all"
    };
  }

  UNSAFE_componentWillMount() {
    this.props.getFolder("");
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    const {
      folder_list,
      add_response,
      edit_response,
      delete_response
    } = newProps;
    if (folder_list && folder_list.code === 200) {
      this.setState({
        folders: folder_list.data,
        filtered_folders: folder_list.data
      });
    } else if (folder_list && folder_list.code === 400) {
      return toaster("error", folder_list.message);
    }

    if (add_response && add_response.code === 200 && addFlag) {
      toaster("success", add_response.message);
      addFlag = false;
      this.setState({ addEditFunc: "" });
      this.props.getFolder("");
    } else if (add_response && add_response.code === 400 && addFlag) {
      toaster("error", add_response.message);
      addFlag = false;
    }

    if (edit_response && edit_response.code === 200 && editFlag) {
      toaster("success", edit_response.message);
      this.props.getFolder("");
      editFlag = false;
      this.setState({ addEditFunc: "" });
    } else if (edit_response && edit_response.code === 400 && editFlag) {
      toaster("error", edit_response.message);
      editFlag = false;
    }

    if (delete_response && delete_response.code === 200 && deleteFlag) {
      toaster("success", delete_response.message);
      this.props.getFolder("");
      deleteFlag = false;
      this.setState({ deletFunc: false });
    } else if (delete_response && delete_response.code === 400 && deleteFlag) {
      toaster("error", delete_response.message);
      deleteFlag = false;
    }
  }

  handleActions = (e, flag, data) => {
    if (flag === "view") {
      this.props.history.push({ pathname: "sets", state: data });
    } else if (flag === "add") {
      this.setState({
        addEditFunc: "add",
        name: "",
        description: "",
        folder_id: ""
      });
    } else if (flag === "edit") {
      this.setState({
        addEditFunc: "edit",
        name: data.name,
        description: data.description,
        folder_id: data.folder_id
      });
    } else if (flag === "delete") {
      this.setState({ folder_id: data.folder_id, deletFunc: true });
    }
  };
  handleChange = (e, name) => {
    if (name === "name" && e.target.value.length > 20) {
      return;
    } else if (name === "description" && e.target.value.length > 100) {
      return;
    }
    this.setState({ [name]: e.target.value });
  };

  modalClose = (e, name) => {
    if (name === "delete_popup") {
      this.setState({
        folder_id: "",
        deletFunc: false
      });
    } else if (name === "add_edit_popup") {
      this.setState({
        addEditFunc: "",
        name: "",
        description: "",
        folder_id: ""
      });
    }
  };

  submitData = (e, flag) => {
    const { name, description, user_id, folder_id } = this.state;
    let formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("user_id", user_id);
    if (flag === "add") {
      if (name === "") {
        return toaster("error", "Please enter folder name");
      }
      this.props.addEditFolder(formData, "add");
      addFlag = true;
    } else if (flag === "edit") {
      if (name === "") {
        return toaster("error", "Please enter folder name");
      }
      formData.append("folder_id", folder_id);
      this.props.addEditFolder(formData, "edit");
      editFlag = true;
    } else if (flag === "delete") {
      this.props.deleteFolder(folder_id);
      deleteFlag = true;
    }
  };

  handleSelect = (e, name) => {
    let folders = this.state.folders;
    if (e.target.value === "all") {
      this.setState({ filtered_folders: folders });
    } else if (e.target.value === "own") {
      let data = [];
      folders.map((o, i) => {
        if (o.user_id === this.state.user_id) {
          data.push(o);
        }
      });
      this.setState({ filtered_folders: data });
    }
    this.setState({ [name]: e.target.value });
  };
  render() {
    const {
      filtered_folders,
      name,
      description,
      addEditFunc,
      toggleFlag,
      deletFunc,
      user_id,
      role,
      folder_owner
    } = this.state;
    return (
      <div>
        {toggleFlag ? (
          <div>
            <section className="cate-hdng">
              <div className="container">
                <div className="cate_hdng">
                  <div className="folder_heading">
                    <h1>folders</h1>
                    <div className="filter_add">
                      <div className="form-group">
                        <label htmlFor="sel1">Filter:</label>
                        <select
                          className="form-control"
                          id="sel1"
                          onChange={e => this.handleSelect(e, "folder_owner")}
                        >
                          <option value="all">All Folders</option>
                          <option value="own">Own Folders</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={e => this.handleActions(e, "add")}
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    non lacus lorem. Mauris rutrum eget tortor quis molestie.
                  </p>
                </div>
              </div>
            </section>
            <section className="cate-sec">
              <div className="container">
                <div className="cate-otr">
                  {filtered_folders.map(data => {
                    return (
                      <div className="cate-inr" key={data.folder_id}>
                        <div className="whvr">
                          <div className="cat-img">
                            <img src="/images/icon1.svg" alt="img" />
                          </div>
                          <div className="car-txt">
                            <h3>{data.name}</h3>
                            <p>{data.description}</p>
                          </div>
                          <div className="cate-brdr"></div>
                        </div>
                        <div className="icns-hvr-otr">
                          <div className="hvr-icns">
                            {(role === "admin" || user_id === data.user_id) && (
                              <img
                                src="/images/icon5.svg"
                                alt="edit"
                                onClick={e =>
                                  this.handleActions(e, "edit", data)
                                }
                              />
                            )}
                            <img
                              src="/images/icon3.svg"
                              alt="view"
                              onClick={e => this.handleActions(e, "view", data)}
                            />
                            {(role === "admin" || user_id === data.user_id) && (
                              <img
                                src="/images/icon4.svg"
                                alt="delete"
                                onClick={e =>
                                  this.handleActions(e, "delete", data)
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="cate-bg-img">
                <img src="/images/circles_bg.png" alt="user" />
              </div>
            </section>
            {deletFunc && (
              <ModalPopup
                className="delete-flag"
                popupOpen={deletFunc}
                popupHide={e => this.modalClose(e, "delete_popup")}
                title="Delete Folder"
                content={<span>Are you sure you want to delete.</span>}
                footer={
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-danger px-4 mr-4"
                      onClick={e => this.modalClose(e, "delete_popup")}
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger px-4"
                      onClick={e => this.submitData(e, "delete")}
                    >
                      PROCEED
                    </button>
                  </div>
                }
              />
            )}
            {addEditFunc !== "" && (
              <ModalPopup
                className="add-edit-flag"
                popupOpen={addEditFunc}
                popupHide={e => this.modalClose(e, "add_edit_popup")}
                title={addEditFunc === "add" ? "Add Folder" : "Edit Folder"}
                content={
                  <div>
                    <div className="row px-md-2">
                      <div className="col-12 mt-1">
                        <div className="form-label-group label-group-circle">
                          <input
                            type="text"
                            name="name"
                            id="c_name"
                            className="form-control"
                            placeholder="Name"
                            value={name}
                            onChange={e => this.handleChange(e, "name")}
                          />
                          <label for="c_name">Folder Name</label>
                        </div>
                      </div>
                      <div className="col-12 mt-1">
                        <div className="form-label-group label-group-circle">
                          <input
                            type="text"
                            id="c_description"
                            className="form-control"
                            placeholder="Description"
                            name="description"
                            value={description}
                            onChange={e => this.handleChange(e, "description")}
                          />
                          <label for="c_description">Folder Description</label>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                footer={
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-danger px-4 mr-4"
                      onClick={e => this.modalClose(e, "add_edit_popup")}
                    >
                      CANCEL
                    </button>
                    {addEditFunc === "add" && (
                      <button
                        type="button"
                        className="btn btn-outline-danger px-4"
                        onClick={e => this.submitData(e, "add")}
                      >
                        ADD
                      </button>
                    )}
                    {addEditFunc === "edit" && (
                      <button
                        type="button"
                        className="btn btn-outline-danger px-4"
                        onClick={e => this.submitData(e, "edit")}
                      >
                        EDIT
                      </button>
                    )}
                  </div>
                }
              />
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}
const mapStateToProps = store => {
  return {
    folder_list: store.folder.folder_list,
    add_response: store.folder.add_response,
    edit_response: store.folder.edit_response,
    delete_response: store.folder.delete_response
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getFolder: params => dispatch(getFolder(params)),
    addEditFolder: (params, flag) => dispatch(addEditFolder(params, flag)),
    deleteFolder: params => dispatch(deleteFolder(params))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Folder);
