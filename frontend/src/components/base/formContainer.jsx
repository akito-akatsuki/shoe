import React, { useEffect, useRef, useState } from "react";
import { Loader } from "./LoaderForm.jsx"; // Giả sử bạn đã có component Loader

import "./css/style.css";

const InputSearch = ({ className = "", list = [], onChange }) => {
  const [selectedText, setSelectedText] = useState("");

  const handleSelect = (item) => {
    setSelectedText(item);
    onChange?.(item); // Gửi dữ liệu ra ngoài nếu có `onChange`
  };

  const filteredList = list.filter((item) =>
    item.toLowerCase().includes(selectedText.toLowerCase())
  );

  return (
    <div
      className={`${className} InputSearch-container`}
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
        margin: ".625rem 0",
      }}
    >
      <div className="InputSearch-input">
        <input
          type="text"
          value={selectedText}
          onChange={(e) => {
            setSelectedText(e.target.value);
            onChange?.(e.target.value);
          }}
        />
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z"></path>
          </svg>
        </span>
      </div>
      <div className="InputSearch-list">
        <ul>
          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <li
                className="InputSearch-list-child"
                key={index}
                onClick={() => {
                  setSelectedText(item);
                  handleSelect(item);
                }}
              >
                {item}
              </li>
            ))
          ) : (
            <li className="no-result">Không tìm thấy kết quả</li>
          )}
        </ul>
      </div>
    </div>
  );
};

const InputSearchSelect = ({
  className = "",
  keyShow,
  list = [],
  onChange,
}) => {
  const [searchText, setSearchText] = useState("");

  const filteredList = list.filter((item) =>
    item[keyShow]?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (item) => {
    setSearchText(item[keyShow]);
    onChange?.(item);
  };

  return (
    <div
      className={`${className} InputSearch-container`}
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
        margin: ".625rem 0",
      }}
    >
      <div className="InputSearch-input">
        <input
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z"></path>
          </svg>
        </span>
      </div>
      <div className="InputSearch-list">
        <ul>
          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <li
                className="InputSearch-list-child"
                key={index}
                onClick={() => handleSelect(item)}
              >
                {item[keyShow]}
              </li>
            ))
          ) : (
            <li className="no-result">Không tìm thấy kết quả</li>
          )}
        </ul>
      </div>
    </div>
  );
};

const InputSearchSelectShow = ({
  className = "",
  keyShow,
  keyList,
  value = "",
  list = [],
  onChange,
}) => {
  const [selected, setSelected] = useState(value);
  const [showList, setShowList] = useState(false);
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Nếu value là object thì lấy ra chuỗi hiển thị
    if (typeof value === "object" && value !== null) {
      setSelected(value[keyShow]);
    } else {
      setSelected(value);
    }
  }, [value, keyShow]);

  const handleEdit = () => {
    setSearchText(selected);
    setShowList(true);
  };

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setShowList(false);
    }
  };

  const displayStyle = {
    cursor: "pointer",
    padding: ".5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: ".625rem",
    borderRadius: ".1875rem",
    ...(showList && { border: "1px solid #ccc" }),
  };

  // Mobile long press handler
  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      handleEdit();
    }, 500); // nhấn giữ 0.5s
  };

  const handleTouchEnd = () => {
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); // hỗ trợ mobile

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const filteredList = list.filter((item) => {
    const displayValue = item[keyList] ?? item[keyShow];
    return (
      typeof displayValue === "string" &&
      displayValue.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleSelect = (item) => {
    setShowList(false);
    setSelected(item[keyShow]);
    setSearchText(item[keyShow]);
    onChange?.(item);
  };

  return (
    <div
      ref={containerRef}
      className={`${className} InputSelect-container`}
      style={{ position: "relative", width: "100%" }}
    >
      {!showList && (
        <div
          className="InputSelect-display"
          onDoubleClick={handleEdit}
          onTouchStart={handleTouchStart} // mobile
          onTouchEnd={handleTouchEnd}
          style={displayStyle}
        >
          {selected || "Chọn..."}
        </div>
      )}

      {showList && (
        <div
          className={`${className} InputSearch-container`}
          style={{
            position: "relative",
            width: "100%",
            height: "auto",
            margin: ".625rem 0",
          }}
        >
          <div className="InputSearch-input">
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z"></path>
              </svg>
            </span>
          </div>
          <div className="InputSearch-list">
            <ul>
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <li
                    className="InputSearch-list-child"
                    key={index}
                    onClick={() => handleSelect(item)}
                  >
                    {item[keyList] ?? item[keyShow]}
                  </li>
                ))
              ) : (
                <li className="no-result">Không tìm thấy kết quả</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const SwitchButton = ({ className = "", value = false, onChange }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(value); // Đồng bộ giá trị bên ngoài
  }, [value]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue); // Gửi giá trị ra ngoài
  };

  return (
    <span
      className={`${className} SwitchButton-container`}
      style={{
        position: "relative",
        width: "auto",
        height: "auto",
        display: "inline-block",
      }}
    >
      <div className="SwitchButton-box">
        <input
          type="checkbox"
          id="SwitchButton-input"
          hidden
          checked={isChecked}
          onChange={handleToggle}
        />
        <label htmlFor="SwitchButton-input" id="SwitchButton-lable"></label>
      </div>
    </span>
  );
};

const InputChange = ({ className = "", value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== value) {
      onChange(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (text !== value) {
        onChange(text);
      }
    }
  };

  // Mobile long press handler
  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      handleEdit();
    }, 500); // nhấn giữ 0.5s
  };

  const handleTouchEnd = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div
      className={`${className} InputChange-container`}
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
        margin: ".625rem 0",
      }}
    >
      <div className="InputChange-box">
        {isEditing ? (
          <input
            type="text"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            onDoubleClick={handleEdit}
            onTouchStart={handleTouchStart} // mobile
            onTouchEnd={handleTouchEnd}
          >
            {text || "Click đúp để sửa"}
          </div>
        )}
      </div>
    </div>
  );
};

const InputSelect = ({ value = "", list = [], onChange, className = "" }) => {
  const [selected, setSelected] = useState(value);
  const [showList, setShowList] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleEdit = () => setShowList(true);

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setShowList(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); // hỗ trợ mobile

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSelect = (item) => {
    setSelected(item);
    setShowList(false);
    onChange?.(item);
  };

  const displayStyle = {
    cursor: "pointer",
    padding: ".5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: ".625rem",
    borderRadius: ".1875rem",
    ...(showList && { border: "1px solid #ccc" }),
  };

  // Mobile long press handler
  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      handleEdit();
    }, 500); // nhấn giữ 0.5s
  };

  const handleTouchEnd = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div
      ref={containerRef}
      className={`${className} InputSelect-container`}
      style={{ position: "relative", width: "100%" }}
    >
      <div
        className="InputSelect-display"
        onDoubleClick={handleEdit}
        onTouchStart={handleTouchStart} // mobile
        onTouchEnd={handleTouchEnd}
        style={displayStyle}
      >
        {selected || "Chọn..."}
        {showList && <span style={{ float: "right" }}>▼</span>}
      </div>

      {showList && (
        <div
          className="InputSelect-dropdown"
          style={{
            position: "absolute",
            width: "100%",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: ".1875rem",
            zIndex: 1,
          }}
        >
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {list.map((item, index) => (
              <li
                key={index}
                style={{
                  padding: ".5rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                onClick={() => handleSelect(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ButtonForm = ({ onLoad, onClick, children, disabled, style = {} }) => {
  return (
    <button
      className="btn btn-primary"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "4rem",
        height: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {onLoad ? <Loader /> : children}
    </button>
  );
};

export {
  ButtonForm,
  InputChange,
  InputSearch,
  InputSearchSelect,
  InputSearchSelectShow,
  InputSelect,
  SwitchButton,
};
