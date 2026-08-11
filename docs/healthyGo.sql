/* ========================================================= */
/* MÃ SQL DDL CHO DỰ ÁN HEALTHYGO (TƯƠNG THÍCH POWERDESIGNER)*/
/* ========================================================= */

CREATE TABLE roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    role_id BIGINT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    is_active TINYINT(1),
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE categories (
    id_category INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at DATETIME,
    updated_at DATETIME,
    status TINYINT(1),
    PRIMARY KEY (id_category)
);

CREATE TABLE product (
    id_product INT NOT NULL AUTO_INCREMENT,
    id_category INT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    discount_price DECIMAL(12,2),
    unit VARCHAR(30),
    stock_quantity INT,
    calories INT,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    image_url VARCHAR(255),
    status VARCHAR(20),
    created_at DATETIME,
    updated_at DATETIME,
    PRIMARY KEY (id_product),
    FOREIGN KEY (id_category) REFERENCES categories(id_category)
);

CREATE TABLE user_addresses (
    id_address INT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    receiver_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_default TINYINT(1),
    created_at DATETIME,
    PRIMARY KEY (id_address),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE login_logs (
    id INT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    email_attempted VARCHAR(255),
    status VARCHAR(20),
    ip_address VARCHAR(45),
    user_agent TEXT,
    reason TEXT,
    created_at DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart (
    id_cart INT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    created_at DATETIME,
    updated_at DATETIME,
    PRIMARY KEY (id_cart),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id_cart_item INT NOT NULL AUTO_INCREMENT,
    id_cart INT,
    id_product INT,
    quantity INT,
    created_at DATETIME,
    updated_at DATETIME,
    PRIMARY KEY (id_cart_item),
    FOREIGN KEY (id_cart) REFERENCES cart(id_cart),
    FOREIGN KEY (id_product) REFERENCES product(id_product)
);

CREATE TABLE orders (
    id_order INT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    note TEXT,
    payment_method VARCHAR(50),
    total_amount INT,
    status VARCHAR(50),
    created_at DATETIME,
    scheduled_time DATETIME,
    PRIMARY KEY (id_order),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id_order_item INT NOT NULL AUTO_INCREMENT,
    id_order INT,
    id_product INT,
    product_name VARCHAR(255),
    quantity INT,
    price INT,
    PRIMARY KEY (id_order_item),
    FOREIGN KEY (id_order) REFERENCES orders(id_order),
    FOREIGN KEY (id_product) REFERENCES product(id_product)
);

CREATE TABLE reviews (
    id_review INT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    id_product INT,
    rating INT,
    comment TEXT,
    created_at DATETIME,
    PRIMARY KEY (id_review),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (id_product) REFERENCES product(id_product)
);

CREATE TABLE notifications (
    id_notification INT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    title VARCHAR(255),
    message TEXT,
    is_read TINYINT(1),
    created_at DATETIME,
    PRIMARY KEY (id_notification),
    FOREIGN KEY (user_id) REFERENCES users(id)
);