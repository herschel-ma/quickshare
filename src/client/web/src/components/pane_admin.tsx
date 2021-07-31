import * as React from "react";
import { Map, Set } from "immutable";

import { ICoreState } from "./core_state";
import { User } from "../client";
import { Updater as PanesUpdater } from "./panes";

export interface Props {
  users: Map<string, User>;
  roles: Set<string>;
  update?: (updater: (prevState: ICoreState) => ICoreState) => void;
}

export interface UserFormProps {
  key: string;
  id: string;
  name: string;
  role: string;
  roles: Set<string>;
  update?: (updater: (prevState: ICoreState) => ICoreState) => void;
}

export interface UserFormState {
  id: string;
  name: string;
  newPwd1: string;
  newPwd2: string;
  role: string;
}

export class UserForm extends React.Component<
  UserFormProps,
  UserFormState,
  {}
> {
  constructor(p: UserFormProps) {
    super(p);
    this.state = {
      id: p.id,
      name: p.name,
      newPwd1: "",
      newPwd2: "",
      role: p.role,
    };
  }

  changePwd1 = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPwd1: ev.target.value });
  };
  changePwd2 = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPwd2: ev.target.value });
  };
  changeRole = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ role: ev.target.value });
  };

  setPwd = () => {
    if (this.state.newPwd1 !== this.state.newPwd2) {
      alert("2 passwords do not match, please check.");
      return;
    }

    PanesUpdater.forceSetPwd(this.state.id, this.state.newPwd1).then(
      (ok: boolean) => {
        if (ok) {
          alert("password is updated");
        } else {
          alert("failed to update password");
        }
        this.setState({
          newPwd1: "",
          newPwd2: "",
        });
      }
    );
  };

  delUser = () => {
    PanesUpdater.delUser(this.state.id)
      .then((ok: boolean) => {
        if (!ok) {
          alert("failed to delete user");
        }
        return PanesUpdater.listUsers();
      })
      .then((_: boolean) => {
        this.props.update(PanesUpdater.updateState);
      });
  };

  // setRole = () => {};

  render() {
    return (
      <span>
        <span className="flex-list-container">
          <div className="flex-list-item-l">
            <span className="vbar green0-bg"></span>
            <div
              className="margin-l-m"
              style={{
                flexDirection: "column",
              }}
            >
              <div className="bold item-name">Name: {this.props.name}</div>
              <div className="grey1-font item-name">
                ID: {this.props.id} / Role: {this.props.role}
              </div>
            </div>
          </div>
          <div
            className="flex-list-item-r"
            style={{
              flexDirection: "column",
              flexBasis: "80%",
              alignItems: "flex-end",
            }}
          >
            <div className="margin-t-m">
              <button
                onClick={this.delUser}
                className="grey1-bg white-font margin-r-m"
              >
                Delete User
              </button>
            </div>

            {/* no API yet */}
            {/* <div className="margin-t-m">
            <input
              name={`${this.props.id}-role`}
              type="text"
              onChange={this.changeRole}
              value={this.state.role}
              className="black0-font margin-r-m"
              placeholder={this.props.role}
            />
            <button
              onClick={this.setRole}
              className="grey1-bg white-font margin-r-m"
            >
              Update Role
            </button>
          </div> */}
          </div>
        </span>

        <div className="margin-t-m">
          <input
            name={`${this.props.id}-pwd1`}
            type="password"
            onChange={this.changePwd1}
            value={this.state.newPwd1}
            className="black0-font margin-r-m"
            placeholder="new password"
          />
          <input
            name={`${this.props.id}-pwd2`}
            type="password"
            onChange={this.changePwd2}
            value={this.state.newPwd2}
            className="black0-font margin-r-m"
            placeholder="repeat password"
          />
          <button
            onClick={this.setPwd}
            className="grey1-bg white-font margin-r-m"
          >
            Update
          </button>
        </div>

      </span>
    );
  }
}

export interface State {
  newUserName: string;
  newUserPwd1: string;
  newUserPwd2: string;
  newUserRole: string;
  newRole: string;
}
export class AdminPane extends React.Component<Props, State, {}> {
  constructor(p: Props) {
    super(p);
    this.state = {
      newUserName: "",
      newUserPwd1: "",
      newUserPwd2: "",
      newUserRole: "",
      newRole: "",
    };
  }

  onChangeUserName = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newUserName: ev.target.value });
  };
  onChangeUserPwd1 = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newUserPwd1: ev.target.value });
  };
  onChangeUserPwd2 = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newUserPwd2: ev.target.value });
  };
  onChangeUserRole = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newUserRole: ev.target.value });
  };
  onChangeRole = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newRole: ev.target.value });
  };

  addRole = () => {
    PanesUpdater.addRole(this.state.newRole)
      .then((ok: boolean) => {
        if (!ok) {
          alert("failed to add role");
        }
        return PanesUpdater.listRoles();
      })
      .then(() => {
        this.props.update(PanesUpdater.updateState);
      });
  };

  delRole = (role: string) => {
    if (
      !confirm(
        "After deleting this role, some of users may not be able to login."
      )
    ) {
      return;
    }

    PanesUpdater.delRole(role)
      .then((ok: boolean) => {
        if (!ok) {
          alert("failed to delete role");
        }
        return PanesUpdater.listRoles();
      })
      .then(() => {
        this.props.update(PanesUpdater.updateState);
      });
  };

  addUser = () => {
    if (this.state.newUserPwd1 !== this.state.newUserPwd2) {
      alert("2 passwords do not match, please check.");
      return;
    }

    PanesUpdater.addUser({
      id: "", // backend will fill it
      name: this.state.newUserName,
      pwd: this.state.newUserPwd1,
      role: this.state.newUserRole,
    })
      .then((ok: boolean) => {
        if (!ok) {
          alert("failed to add user");
        }
        this.setState({
          newUserName: "",
          newUserPwd1: "",
          newUserPwd2: "",
          newUserRole: "",
        });
        return PanesUpdater.listUsers();
      })
      .then(() => {
        this.props.update(PanesUpdater.updateState);
      });
  };

  render() {
    const userList = this.props.users.valueSeq().map((user: User) => {
      return (
        <div className="margin-t-m">
          <UserForm
            key={user.id}
            id={user.id}
            name={user.name}
            role={user.role}
            roles={this.props.roles}
            update={this.props.update}
          />
        </div>
      );
    });

    const roleList = this.props.roles.valueSeq().map((role: string) => {
      return (
        <div key={role} className="flex-list-container margin-b-m">
          <div className="flex-list-item-l">
            <span className="dot red0-bg"></span>
            <span className="bold">{role}</span>
          </div>
          <div className="flex-list-item-r">
            <button
              onClick={() => {
                this.delRole(role);
              }}
              className="grey1-bg white-font margin-r-m"
            >
              Delete
            </button>
          </div>
        </div>
      );
    });

    return (
      <div className="font-size-m">
        <div className="container">
          <div className="flex-list-container padding-l">
            {/* <span className="inline-block margin-t-m margin-b-m"> */}
            <div
              className="flex-list-item-l"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <input
                type="text"
                onChange={this.onChangeUserName}
                value={this.state.newUserName}
                className="black0-font margin-b-m"
                placeholder="new user name"
              />
              <input
                type="text"
                onChange={this.onChangeUserRole}
                value={this.state.newUserRole}
                className="black0-font margin-b-m"
                placeholder="new user role"
              />
              <input
                type="password"
                onChange={this.onChangeUserPwd1}
                value={this.state.newUserPwd1}
                className="black0-font margin-b-m"
                placeholder="password"
              />
              <input
                type="password"
                onChange={this.onChangeUserPwd2}
                value={this.state.newUserPwd2}
                className="black0-font margin-b-m"
                placeholder="repeat password"
              />
            </div>
            <div className="flex-list-item-r">
              <button
                onClick={this.addUser}
                className="grey1-bg white-font margin-r-m"
              >
                Create User
              </button>
            </div>
            {/* </span> */}
          </div>
        </div>

        <div className="container">
          <div className="padding-l">
            <div className="flex-list-container bold">
              <span className="flex-list-item-l">
                <span className="dot black-bg"></span>
                <span>Users</span>
              </span>
              <span className="flex-list-item-r padding-r-m"></span>
            </div>
            {userList}
          </div>
        </div>

        <div className="container">
          <div className="flex-list-container padding-l">
            <div className="flex-list-item-l">
              <span className="inline-block margin-t-m margin-b-m">
                <input
                  type="text"
                  onChange={this.onChangeRole}
                  value={this.state.newRole}
                  className="black0-font margin-r-m"
                  placeholder="new role name"
                />
              </span>
            </div>
            <div className="flex-list-item-r">
              <button
                onClick={this.addRole}
                className="grey1-bg white-font margin-r-m"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="padding-l">
            <div className="flex-list-container bold margin-b-m">
              <span className="flex-list-item-l">
                <span className="dot black-bg"></span>
                <span>Roles</span>
              </span>
              <span className="flex-list-item-r padding-r-m"></span>
            </div>
            {roleList}
          </div>
        </div>
      </div>
    );
  }
}
