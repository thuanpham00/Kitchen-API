# TÀI LIỆU PRISMA - PHÂN BIỆT FIELDS & @RELATION

## 📌 PHÂN LOẠI FIELDS TRONG PRISMA

### 1. **Scalar Fields** - Cột thật trong Database

```prisma
model Account {
  id       Int     @id @default(autoincrement())  // Scalar
  name     String                                  // Scalar
  email    String  @unique                         // Scalar
  ownerId  Int?                                    // Scalar - Foreign Key
}
```

- ✅ **Tồn tại thực tế** trong database
- ✅ Lưu trữ giá trị cụ thể
- ✅ Có thể là Primary Key, Foreign Key, hoặc field thông thường

---

### 2. **Relation Fields** - Virtual Fields (không có trong DB)

```prisma
model Account {
  employees    Account[]      // Virtual - Relation field
  owner        Account?       // Virtual - Relation field
  orders       Order[]        // Virtual - Relation field
  refreshToken RefreshToken[] // Virtual - Relation field
}
```

- ❌ **KHÔNG tồn tại** trong database
- ✅ Chỉ để Prisma hiểu **quan hệ** giữa các bảng
- ✅ Dùng để **query/include** dữ liệu liên quan
- ✅ Tự động populate khi sử dụng `include`

---

### 3. **Foreign Key Fields** - Cột thật, tham chiếu bảng khác

```prisma
model Order {
  tableNumber    Int?     // Foreign Key (scalar)
  orderHandlerId Int?     // Foreign Key (scalar)
  guestId        Int?     // Foreign Key (scalar)
}
```

- ✅ **Tồn tại thực tế** trong database
- ✅ Lưu ID của record ở bảng khác
- ✅ Tham chiếu đến Primary Key của bảng khác

---

## 🔗 @RELATION - KHI NÀO CẦN, KHI NÀO KHÔNG?

### ✅ **Bảng CÓ Foreign Key → BẮT BUỘC @relation**

```prisma
model Order {
  // Scalar field - FK
  tableNumber Int?

  // Relation field - PHẢI có @relation
  table Table? @relation(
    fields: [tableNumber],      // FK ở đây
    references: [number],        // PK bên Table
    onDelete: SetNull,           // Hành vi khi delete
    onUpdate: NoAction           // Hành vi khi update
  )
}
```

**Giải thích:**

- `fields: [tableNumber]` - Field nào là FK
- `references: [number]` - FK tham chiếu đến field nào bên Table
- `onDelete: SetNull` - Khi xóa Table → set `tableNumber = null`
- `onUpdate: NoAction` - Khi update Table.number → không làm gì

---

### ❌ **Bảng KHÔNG có FK → KHÔNG cần @relation**

```prisma
model Table {
  number Int @id    // Primary Key

  // Relation fields - KHÔNG cần @relation
  orders Order[]    // Query ngược từ Order.table
  guests Guest[]    // Query ngược từ Guest.table
}
```

**Giải thích:**

- Table không chứa FK của Order hay Guest
- Prisma tự hiểu relation ngược chiều từ `Order.table` và `Guest.table`
- Chỉ cần khai báo relation field để query

---

## 📊 SO SÁNH DATABASE THỰC TẾ

### **Database SQL:**

```sql
CREATE TABLE "Order" (
  id INTEGER PRIMARY KEY,
  tableNumber INTEGER,           -- ← FK (cột thật)
  FOREIGN KEY (tableNumber) REFERENCES Table(number)
);

CREATE TABLE "Table" (
  number INTEGER PRIMARY KEY
  -- KHÔNG có cột "orders" hay "guests"
);
```

### **Prisma Query:**

```typescript
// Query từ Order → Table (theo chiều FK)
const order = await prisma.order.findUnique({
  where: { id: 1 },
  include: { table: true } // Kéo thông tin Table
})

// Query ngược từ Table → Orders
const table = await prisma.table.findUnique({
  where: { number: 3 },
  include: {
    orders: true, // Lấy tất cả orders của bàn này
    guests: true // Lấy tất cả guests của bàn này
  }
})
```

---

## 🎯 QUY TẮC VÀNG

| Bên           | Có FK?   | Cần @relation? | Ví dụ          |
| ------------- | -------- | -------------- | -------------- |
| **Many side** | ✅ Có    | ✅ Cần         | `Order.table`  |
| **One side**  | ❌ Không | ❌ Không cần   | `Table.orders` |

---

## 📝 VÍ DỤ ĐẦY ĐỦ

### **1-N Relationship: Table ↔ Order**

```prisma
// Bên N (Order) - CÓ FK
model Order {
  id          Int    @id @default(autoincrement())
  tableNumber Int?   // ← FK (scalar)

  table Table? @relation(           // ← Relation field + @relation
    fields: [tableNumber],
    references: [number],
    onDelete: SetNull
  )
}

// Bên 1 (Table) - KHÔNG có FK
model Table {
  number Int   @id                  // ← PK
  orders Order[]                    // ← Relation field (không cần @relation)
}
```

### **1-1 Relationship: Socket ↔ Account**

```prisma
// Bên có FK
model Socket {
  socketId  String   @id
  accountId Int?     @unique       // ← FK + unique = 1-1

  account Account? @relation(      // ← @relation
    fields: [accountId],
    references: [id],
    onDelete: SetNull
  )
}

// Bên không có FK
model Account {
  id      Int      @id
  sockets Socket[]                 // ← Array nhưng max 1 (vì @unique)
}
```

---

## ⚙️ onDelete & onUpdate - REFERENTIAL ACTIONS

### **onDelete** - Hành vi khi XÓA record cha

| Option       | Ý nghĩa      | Ví dụ                                |
| ------------ | ------------ | ------------------------------------ |
| **Cascade**  | Xóa theo     | Xóa Account → Xóa RefreshToken       |
| **SetNull**  | Set NULL     | Xóa Table → Order.tableNumber = null |
| **Restrict** | Chặn xóa     | Không cho xóa nếu còn liên kết       |
| **NoAction** | Không làm gì | Database tự xử lý                    |

```prisma
// Cascade - Xóa theo
model RefreshToken {
  account Account @relation(
    fields: [accountId],
    references: [id],
    onDelete: Cascade  // ← Xóa Account → Xóa RefreshToken
  )
}

// SetNull - Set NULL (field phải nullable)
model Order {
  tableNumber Int?
  table Table? @relation(
    fields: [tableNumber],
    references: [number],
    onDelete: SetNull  // ← Xóa Table → tableNumber = null
  )
}
```

### **onUpdate** - Hành vi khi UPDATE khóa chính

| Option       | Ý nghĩa      | Khi nào dùng                  |
| ------------ | ------------ | ----------------------------- |
| **Cascade**  | Update theo  | Update PK → FK tự động update |
| **NoAction** | Không làm gì | PK không thay đổi (phổ biến)  |

```prisma
model Order {
  dishSnapshot DishSnapshot @relation(
    fields: [dishSnapshotId],
    references: [id],
    onDelete: Cascade,
    onUpdate: Cascade  // ← Update DishSnapshot.id → dishSnapshotId update theo
  )
}
```

**⚠️ Lưu ý:**

- Field phải **nullable** (`Int?`) nếu dùng `onDelete: SetNull`
- `Cascade` nguy hiểm - có thể xóa hàng loạt
- SQLite hỗ trợ hạn chế, nên test kỹ

---

## 💡 LƯU Ý QUAN TRỌNG

1. **@relation chỉ cần khai báo ở 1 bên** - bên có FK
2. **Relation field ở bên còn lại tự động hiểu** ngược chiều
3. **Scalar field (FK) + Relation field** luôn đi cùng nhau
4. **Database chỉ lưu FK**, không lưu relation fields
5. **Include** sẽ tự động JOIN và populate data

---

## 🚀 KẾT LUẬN

- **Scalar Fields** = Cột thật trong DB
- **Relation Fields** = Virtual, dùng để query
- **@relation** = Chỉ cần ở bên có FK
- **Prisma tự động handle** relation ngược chiều

---
