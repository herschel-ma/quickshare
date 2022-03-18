import * as React from "react";
import { List } from "immutable";
import FileSize from "filesize";

import { RiUploadCloudFill } from "@react-icons/all-files/ri/RiUploadCloudFill";
import { RiCloudOffFill } from "@react-icons/all-files/ri/RiCloudOffFill";

import { BtnList } from "./control/btn_list";
import { alertMsg } from "../common/env";
import { getErrMsg } from "../common/utils";
import { updater } from "./state_updater";
import { ICoreState, MsgProps, UIProps } from "./core_state";
import { LoginProps } from "./pane_login";
import { UploadEntry, UploadState } from "../worker/interface";
import { Flexbox } from "./layout/flexbox";
import { Container } from "./layout/container";
import { Rows } from "./layout/rows";
import { NotFoundBanner } from "./visual/notfound";
import { loadingCtrl, ctrlOn, ctrlOff } from "../common/controls";
import { HotkeyHandler } from "../common/hotkeys";

export interface UploadingsProps {
  uploadings: List<UploadEntry>;
  uploadFiles: List<File>;
  orderBy: string;
  order: boolean;
}
export interface Props {
  uploadingsInfo: UploadingsProps;
  msg: MsgProps;
  login: LoginProps;
  ui: UIProps;
  update?: (updater: (prevState: ICoreState) => ICoreState) => void;
}

export interface State {}

export class UploadingsPanel extends React.Component<Props, State, {}> {
  private hotkeyHandler: HotkeyHandler;

  constructor(p: Props) {
    super(p);
    this.state = {};
  }

  componentDidMount(): void {
    this.hotkeyHandler = new HotkeyHandler();

    document.addEventListener("keyup", this.hotkeyHandler.handle);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.hotkeyHandler.handle);
  }

  setLoading = (state: boolean) => {
    updater().setControlOption(loadingCtrl, state ? ctrlOn : ctrlOff);
    this.props.update(updater().updateUI);
  };

  deleteUpload = async (filePath: string): Promise<void> => {
    this.setLoading(true);

    try {
      const deleteStatus = await updater().deleteUpload(filePath);
      if (deleteStatus !== "") {
        throw deleteStatus;
      }

      const statuses = await Promise.all([updater().self()]);
      if (statuses.join("") !== "") {
        throw statuses.join(";");
      }

      this.props.update(updater().updateLogin);
      this.props.update(updater().updateUploadingsInfo);
    } catch (status: any) {
      alertMsg(getErrMsg(this.props.msg.pkg, "op.fail", status.toString()));
    } finally {
      this.setLoading(false);
    }
  };

  stopUploading = (filePath: string) => {
    updater().stopUploading(filePath);
    this.props.update(updater().updateUploadingsInfo);
  };

  makeRowsInputs = (uploadings: List<UploadEntry>): List<React.ReactNode> => {
    return uploadings.map((uploading: UploadEntry) => {
      const pathParts = uploading.filePath.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const progress =
        uploading.size === 0
          ? 100
          : Math.floor((uploading.uploaded / uploading.size) * 100);

      let uploadState = <span></span>;
      switch (uploading.state) {
        case UploadState.Error:
          uploadState = (
            <span className="badge white-font red0-bg margin-r-m">
              {this.props.msg.pkg.get("state.error")}
            </span>
          );
          break;
        case UploadState.Stopped:
          uploadState = (
            <span className="badge yellow0-font black-bg margin-r-m">
              {this.props.msg.pkg.get("state.stopped")}
            </span>
          );
          break;
        default:
        // no op
      }

      const stopButton =
        uploading.state !== UploadState.Error &&
        uploading.state !== UploadState.Stopped ? (
          <button
            onClick={() => this.stopUploading(uploading.filePath)}
            className="inline-block margin-r-m margin-b-m"
          >
            {this.props.msg.pkg.get("browser.stop")}
          </button>
        ) : null;

      const operations = (
        <div>
          {uploadState}
          {stopButton}
          <button
            onClick={() => this.deleteUpload(uploading.filePath)}
            className="inline-block"
          >
            {this.props.msg.pkg.get("browser.delete")}
          </button>
        </div>
      );

      const progressBar = (
        <div className="progress-grey margin-t-s">
          <div
            className="progress-green"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      );

      const errorInfo =
        uploading.err.trim() === "" ? null : (
          <div className="error">{uploading.err.trim()}</div>
        );

      const elem = (
        <div key={uploading.filePath} className="upload-item">
          <div className={`font-s info`}>
            <span className="title">{fileName}&nbsp;</span>
            <span className="desc grey0-font">
              {FileSize(uploading.uploaded, { round: 0 })}
              &nbsp;/&nbsp;
              {FileSize(uploading.size, {
                round: 0,
              })}
              &nbsp;/&nbsp;
              {`${progress}%`}
            </span>
          </div>

          <div className="op">{operations}</div>

          {progressBar}
          {errorInfo}
        </div>
      );

      return elem;
    });
  };

  updateUploadings = (uploadings: Object) => {
    const newUploadings = uploadings as List<UploadEntry>;
    updater().updateUploadings(newUploadings);
    this.props.update(updater().updateUploadingsInfo);
  };

  orderBy = (columnName: string) => {
    const order = !this.props.uploadingsInfo.order;
    updater().sortUploadings(columnName, order);
    this.props.update(updater().updateUploadingsInfo);
  };

  render() {
    const title = (
      <Flexbox
        children={List([
          <Flexbox
            children={List([
              <RiUploadCloudFill
                size="3.2rem"
                className="margin-r-m black-font"
              />,

              <span className="title-m bold">
                {this.props.msg.pkg.get("browser.upload.title")}
              </span>,
            ])}
          />,

          <span></span>,
        ])}
      />
    );

    const orderByCallbacks = List([
      () => {
        this.orderBy(this.props.msg.pkg.get("item.path"));
      },
    ]);
    const orderByButtons = (
      <BtnList
        titleIcon="BiSortUp"
        btnNames={List([this.props.msg.pkg.get("item.path")])}
        btnCallbacks={orderByCallbacks}
      />
    );

    const uploadingRows = this.makeRowsInputs(
      this.props.uploadingsInfo.uploadings
    );
    const view =
      this.props.uploadingsInfo.uploadings.size > 0 ? (
        <div>
          {orderByButtons}
          <Rows rows={uploadingRows} />
        </div>
      ) : (
        <NotFoundBanner title={this.props.msg.pkg.get("upload.404.title")} />
      );

    return (
      <div id="upload-list">
        <Container>
          {title}
          <div className="hr"></div>
          {view}
        </Container>
      </div>
    );
  }
}
