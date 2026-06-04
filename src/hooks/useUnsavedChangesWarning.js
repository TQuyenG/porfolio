import { useState, useEffect } from 'react';

export default function useUnsavedChangesWarning(initialDirtyState = false) {
  const [isDirty, setIsDirty] = useState(initialDirtyState);

  // Bẫy chặn đóng/F5 tab trình duyệt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa được lưu! Rời khỏi trang sẽ làm mất dữ liệu.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Hàm kiểm tra khi người dùng bấm nút Hủy hoặc Chuyển trang
  const checkUnsavedChanges = (customMessage) => {
    if (isDirty) {
      const message = customMessage || "Bạn có thay đổi chưa được lưu! Thoát ra lúc này sẽ làm mất toàn bộ các chỉnh sửa. Bạn vẫn muốn đóng?";
      return window.confirm(message);
    }
    return true; // Trả về true nếu không có thay đổi nào, cho phép đi tiếp
  };

  return [isDirty, setIsDirty, checkUnsavedChanges];
}