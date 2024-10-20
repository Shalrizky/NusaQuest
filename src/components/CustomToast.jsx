import { Toast, ToastContainer, Button } from "react-bootstrap";
import { CircleCheckBig, AlertTriangle } from "lucide-react";

const CustomToast = ({
  showToast,
  setShowToast,
  title,
  body,
  bgColor,
  actionType,
  onExtendSession,
  onCancelSession,
}) => {
  return (
    <ToastContainer
      position="top-center"
      className="p-3"
      style={{ zIndex: 5 }}
    >
      <Toast
        onClose={() => actionType !== "warning" && setShowToast(false)}
        show={showToast}
        delay={actionType === "warning" ? null : 3000} // Only auto-hide if not a warning
        autohide={actionType !== "warning"}
        bg={bgColor}
      >
        <Toast.Header closeButton={actionType !== "warning"}>
          {actionType === "success" ? (
            <CircleCheckBig className="me-2 text-success" />
          ) : (
            <AlertTriangle className="me-2 text-danger" />
          )}
          <strong className="me-auto">{title}</strong>
        </Toast.Header>
        <Toast.Body style={{ color: "white" }}>
          {body}
          {actionType === "warning" && (
            <div className="mt-2 d-flex justify-content-end">
              <Button
                variant="danger"
                size="sm"
                className="me-2"
                onClick={onCancelSession}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={onExtendSession}>
                Extend
              </Button>
            </div>
          )}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default CustomToast;
