import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Users, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Nav, Navbar, Container } from "react-bootstrap";

const Sidebar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 992);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      label: "Dashboard", 
      icon: <Home size={20} />, 
      path: "/admin" 
    },
    { 
      label: "All Users", 
      icon: <Users size={20} />, 
      path: "/admin/users" 
    },
    { 
      label: "All Posts", 
      icon: <FileText size={20} />, 
      path: "/admin/tasks" 
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/");
  };

  // Variants for animations
  const sidebarVariants = {
    expanded: { width: "230px" },
    collapsed: { width: "100px" },
    mobileOpen: { x: 0 },
    mobileClosed: { x: "-100%" }
  };

  const menuItemVariants = {
    expanded: { opacity: 1, display: "block" },
    collapsed: { opacity: 0, display: "none", transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Top Navbar (visible on all devices) */}
      <Navbar 
        bg="white" 
        expand={false} 
        className="fixed-top shadow-sm py-2" 
        style={{ zIndex: 1030 }}
      >
        <Container fluid className="px-4">
          <div className="d-flex align-items-center">
            <Button
              variant="light"
              className="d-lg-none me-2 p-1 border-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </Button>
            <Navbar.Brand className="m-0 d-flex align-items-center">
              <div className="bg-primary rounded-circle px-2 py-1 d-flex justify-content-center align-items-center">
                <span className="text-white fw-bold">A</span>
              </div>
              <span className="ms-2 fw-bold">Admin Portal</span>
            </Navbar.Brand>
          </div>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill px-3 d-none d-md-inline-block"
              onClick={handleLogout}
            >
              <LogOut size={16} className="me-1" /> Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Desktop Sidebar */}
      <motion.div
        className="d-none d-lg-block position-fixed bg-white shadow-sm h-100 pt-5 mt-4 " 
        style={{ top: 0, left: 0, zIndex: 1020 }}
        initial="expanded"
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="d-flex flex-column h-100">
          {/* Toggle button */}
          <Button
            variant="light"
            size="sm"
            className="align-self-end border-0 me-2 mt-2 p-1"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight 
              size={18} 
              style={{ 
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }} 
            />
          </Button>

          {/* Logo and Brand - shown when expanded */}
          <motion.div 
            className="text-center mb-4 mt-4"
            variants={menuItemVariants}
            initial="expanded"
            animate={collapsed ? "collapsed" : "expanded"}
          >
            <div className="d-flex justify-content-center align-items-center">
              <div className="bg-primary rounded-circle px-3 py-2">
                <span className="text-white fw-bold fs-4">A</span>
              </div>
            </div>
            <h5 className="mt-3 mb-0">Admin Portal</h5>
          </motion.div>

          {/* Nav Items */}
          <Nav className="flex-column px-3 mt-4">
            {menuItems.map((item, index) => (
              <Nav.Item key={index} className="mb-2">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link d-flex align-items-center p-3 rounded-3 ${
                      isActive ? "bg-light text-primary fw-medium" : "text-secondary"
                    }`
                  }
                >
                  <div>{item.icon}</div>
                  <motion.span 
                    className="ms-3"
                    variants={menuItemVariants}
                    initial="expanded"
                    animate={collapsed ? "collapsed" : "expanded"}
                  >
                    {item.label}
                  </motion.span>
                </NavLink>
              </Nav.Item>
            ))}
          </Nav>

         
        </div>
      </motion.div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="position-fixed top-0 left-0 w-100 h-100 bg-black"
              style={{ zIndex: 1040 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile drawer */}
            <motion.div
              className="position-fixed top-0 left-0 h-100 bg-white shadow"
              style={{ width: "280px", zIndex: 1050 }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="d-flex flex-column h-100">
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary rounded-circle p-2 d-flex justify-content-center align-items-center">
                      <span className="text-white fw-bold">A</span>
                    </div>
                    <span className="ms-2 fw-bold">Admin Portal</span>
                  </div>
                  <Button
                    variant="light"
                    className="p-1 border-0"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X size={24} />
                  </Button>
                </div>
                
                <Nav className="flex-column p-3">
                  {menuItems.map((item, index) => (
                    <Nav.Item key={index} className="mb-2">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => 
                          `nav-link d-flex align-items-center p-3 rounded-3 ${
                            isActive ? "bg-light text-primary fw-medium" : "text-secondary"
                          }`
                        }
                      >
                        {item.icon}
                        <span className="ms-3">{item.label}</span>
                      </NavLink>
                    </Nav.Item>
                  ))}
                </Nav>
                
                <div className="mt-auto p-3 border-top">
                  <Button
                    variant="outline-danger"
                    className="w-100 py-2 d-flex align-items-center justify-content-center"
                    onClick={handleLogout}
                  >
                    <LogOut size={20} className="me-2" /> Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </>
  );
};

export default Sidebar;