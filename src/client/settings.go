package client

import (
	"encoding/json"
	"fmt"
	"net/http"

	// "github.com/ihexxa/quickshare/src/db/sitestore"
	"github.com/ihexxa/quickshare/src/handlers/settings"
	"github.com/parnurzeal/gorequest"
)

type SettingsClient struct {
	addr string
	r    *gorequest.SuperAgent
}

func NewSettingsClient(addr string) *SettingsClient {
	gr := gorequest.New()
	return &SettingsClient{
		addr: addr,
		r:    gr,
	}
}

func (cl *SettingsClient) url(urlpath string) string {
	return fmt.Sprintf("%s%s", cl.addr, urlpath)
}

func (cl *SettingsClient) Health() (*http.Response, string, []error) {
	return cl.r.Options(cl.url("/v1/settings/health")).
		End()
}

func (cl *SettingsClient) GetClientCfg(token *http.Cookie) (*http.Response, *settings.ClientCfgMsg, []error) {
	resp, body, errs := cl.r.Get(cl.url("/v1/settings/client")).
		AddCookie(token).
		End()

	mResp := &settings.ClientCfgMsg{}
	err := json.Unmarshal([]byte(body), mResp)
	if err != nil {
		errs = append(errs, err)
		return nil, nil, errs
	}
	return resp, mResp, nil
}

func (cl *SettingsClient) SetClientCfg(cfgMsg *settings.ClientCfgMsg, token *http.Cookie) (*http.Response, string, []error) {
	return cl.r.Patch(cl.url("/v1/settings/client")).
		AddCookie(token).
		Send(cfgMsg).
		End()
}

func (cl *SettingsClient) ReportErrors(reports *settings.ClientErrorReports, token *http.Cookie) (*http.Response, string, []error) {
	return cl.r.Post(cl.url("/v1/settings/errors")).
		AddCookie(token).
		Send(reports).
		End()
}

func (cl *SettingsClient) WorkerQueueLen(token *http.Cookie) (*http.Response, *settings.WorkerQueueLenResp, []error) {
	resp, body, errs := cl.r.Get(cl.url("/v1/settings/workers/queue-len")).
		AddCookie(token).
		End()

	mResp := &settings.WorkerQueueLenResp{}
	err := json.Unmarshal([]byte(body), mResp)
	if err != nil {
		errs = append(errs, err)
		return nil, nil, errs
	}
	return resp, mResp, nil
}
