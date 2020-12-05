package memstore

import (
	"sync"

	"github.com/ihexxa/quickshare/src/kvstore"
)

type MemStore struct {
	bools      map[string]bool
	boolsMtx   *sync.Mutex
	ints       map[string]int
	intsMtx    *sync.Mutex
	int64s     map[string]int64
	int64sMtx  *sync.Mutex
	floats     map[string]float64
	floatsMtx  *sync.Mutex
	strings    map[string]string
	stringsMtx *sync.Mutex
	locks      map[string]bool
	locksMtx   *sync.Mutex
}

func New() *MemStore {
	return &MemStore{
		bools:      map[string]bool{},
		boolsMtx:   &sync.Mutex{},
		ints:       map[string]int{},
		intsMtx:    &sync.Mutex{},
		int64s:     map[string]int64{},
		int64sMtx:  &sync.Mutex{},
		floats:     map[string]float64{},
		floatsMtx:  &sync.Mutex{},
		strings:    map[string]string{},
		stringsMtx: &sync.Mutex{},
		locks:      map[string]bool{},
		locksMtx:   &sync.Mutex{},
	}
}

func (st *MemStore) GetBool(key string) (bool, bool) {
	st.boolsMtx.Lock()
	defer st.boolsMtx.Unlock()
	val, ok := st.bools[key]
	return val, ok
}

func (st *MemStore) SetBool(key string, val bool) error {
	st.boolsMtx.Lock()
	defer st.boolsMtx.Unlock()
	st.bools[key] = val
	return nil
}

func (st *MemStore) GetInt(key string) (int, bool) {
	st.intsMtx.Lock()
	defer st.intsMtx.Unlock()
	val, ok := st.ints[key]
	return val, ok
}

func (st *MemStore) SetInt(key string, val int) error {
	st.intsMtx.Lock()
	defer st.intsMtx.Unlock()
	st.ints[key] = val
	return nil
}

func (st *MemStore) GetInt64(key string) (int64, bool) {
	st.int64sMtx.Lock()
	defer st.int64sMtx.Unlock()
	val, ok := st.int64s[key]
	return val, ok
}

func (st *MemStore) SetInt64(key string, val int64) error {
	st.int64sMtx.Lock()
	defer st.int64sMtx.Unlock()
	st.int64s[key] = val
	return nil
}

func (st *MemStore) GetFloat(key string) (float64, bool) {
	st.floatsMtx.Lock()
	defer st.floatsMtx.Unlock()
	val, ok := st.floats[key]
	return val, ok
}

func (st *MemStore) SetFloat(key string, val float64) error {
	st.floatsMtx.Lock()
	defer st.floatsMtx.Unlock()
	st.floats[key] = val
	return nil
}

func (st *MemStore) GetString(key string) (string, bool) {
	st.stringsMtx.Lock()
	defer st.stringsMtx.Unlock()
	val, ok := st.strings[key]
	return val, ok
}

func (st *MemStore) SetString(key string, val string) error {
	st.stringsMtx.Lock()
	defer st.stringsMtx.Unlock()
	st.strings[key] = val
	return nil
}

func (st *MemStore) DelBool(key string) error {
	st.boolsMtx.Lock()
	defer st.boolsMtx.Unlock()
	delete(st.bools, key)
	return nil
}

func (st *MemStore) DelInt(key string) error {
	st.intsMtx.Lock()
	defer st.intsMtx.Unlock()
	delete(st.ints, key)
	return nil
}

func (st *MemStore) DelInt64(key string) error {
	st.int64sMtx.Lock()
	defer st.int64sMtx.Unlock()
	delete(st.int64s, key)
	return nil
}

func (st *MemStore) DelFloat(key string) error {
	st.floatsMtx.Lock()
	defer st.floatsMtx.Unlock()
	delete(st.floats, key)
	return nil
}

func (st *MemStore) DelString(key string) error {
	st.stringsMtx.Lock()
	defer st.stringsMtx.Unlock()
	delete(st.strings, key)
	return nil
}

func (st *MemStore) TryLock(key string) error {
	st.stringsMtx.Lock()
	defer st.stringsMtx.Unlock()
	_, ok := st.locks[key]
	if ok {
		return kvstore.ErrLocked
	}
	st.locks[key] = true
	return nil
}

func (st *MemStore) Unlock(key string) error {
	st.stringsMtx.Lock()
	defer st.stringsMtx.Unlock()
	_, ok := st.locks[key]
	if !ok {
		return kvstore.ErrNoLock
	}
	delete(st.locks, key)
	return nil
}
