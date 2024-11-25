const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const { User  }= require("../models/user");
const { Category } = require("../models/category");
const {
  MetalCategory,
  MetalMaterial,
  MetalDiamondType,
} = require("../models/metalCategory");

exports.addMetalCategory = async (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
      const userData = await User.findById(req.token.userid)
        .select("verified role")
        .lean();
      if (userData && userData.verified == true) {
        const { metalcategoryid, name, material, diamond_type } = req.body;

        if (
          metalcategoryid &&
          metalcategoryid != "" &&
          mongoose.Types.ObjectId.isValid(metalcategoryid)
        ) {
          const obj = {
            name: name,
            material: material,
            diamond_type: diamond_type,
          };
          await MetalCategory.findByIdAndUpdate(metalcategoryid, obj);

          let metalCategoryData = await MetalCategory.findById(metalcategoryid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Category updated",
            metalCategoryData,
            res
          );
        } else {
          const obj = {
            name: name,
            material: material,
            diamond_type: diamond_type,
          };
          const metalCategoryData = await MetalCategory.create(obj);
          return responseManager.onSuccess(
            "Category created successfully!",
            metalCategoryData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "User not verified" },
          res
        );
      }
    } else {
      return responseManager.badrequest(
        { message: "Invalid token to add category" },
        res
      );
    }
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.listMetalCategory = async (req, res) => {
  MetalCategory.find()
    .select("name")
    .lean()
    .then((metalCategoryData) => {
      return responseManager.onSuccess("Category list", metalCategoryData, res);
    })
    .catch((error) => {
      return responseManager.onError(error, res);
    });
};

exports.getOneMetalCategory = async (req, res) => {
  const { metalcategory } = req.query;

  MetalCategory.findOne({
    name: metalcategory,
  })
    .populate([
      {
        path: "material",
        populate: {
          path: "material",
          model: MetalMaterial,
          select: "name",
        },
      },
      {
        path: "diamond_type",
        populate: {
          path: "type",
          model: MetalDiamondType,
          select: "name",
        },
      },
    ])
    .select("-createdAt -updatedAt -__v")
    .lean()
    .then((metalCategoryData) => {
      return responseManager.onSuccess("Category data", metalCategoryData, res);
    })
    .catch((error) => {
      return responseManager.onError(error, res);
    });
};

exports.removeMetalCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { metalcategoryid } = req.body;

      if (
        metalcategoryid &&
        metalcategoryid != "" &&
        mongoose.Types.ObjectId.isValid(metalcategoryid)
      ) {
        await MetalCategory.findByIdAndRemove(metalcategoryid);
        return responseManager.onSuccess(
          "Category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id to remove product" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove category" },
      res
    );
  }
};

exports.addMetalDiamondType = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { metaldiamondtypeid, metalcategoryid, name } = req.body;
      if (
        metalcategoryid &&
        metalcategoryid != "" &&
        mongoose.Types.ObjectId.isValid(metalcategoryid)
      ) {
        if (
          metaldiamondtypeid &&
          metaldiamondtypeid != "" &&
          mongoose.Types.ObjectId.isValid(metaldiamondtypeid)
        ) {
          const obj = {
            metalcategoryid: metalcategoryid,
            name: name,
          };
          await MetalDiamondType.findByIdAndUpdate(metaldiamondtypeid, obj);

          let metalDiamondTypeData = await MetalDiamondType.findById(
            metaldiamondtypeid
          )
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Sub category updated",
            metalDiamondTypeData,
            res
          );
        } else {
          const obj = {
            metalcategoryid: metalcategoryid,
            name: name,
          };
          const metalDiamondTypeData = await MetalDiamondType.create(obj);
          await MetalCategory.findByIdAndUpdate(metalcategoryid, {
            $push: { diamond_type: { type: metalDiamondTypeData._id } },
          });
          return responseManager.onSuccess(
            "Sub category added successfully",
            metalDiamondTypeData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add category" },
      res
    );
  }
};

exports.addMetalMaterial = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { metalmaterialid, metalcategoryid, name } = req.body;

      if (
        metalcategoryid &&
        metalcategoryid != "" &&
        mongoose.Types.ObjectId.isValid(metalcategoryid)
      ) {
        if (
          metalmaterialid &&
          metalmaterialid != "" &&
          mongoose.Types.ObjectId.isValid(metalmaterialid)
        ) {
          const obj = {
            metalcategoryid: metalcategoryid,
            name: name,
          };
          await MetalMaterial.findByIdAndUpdate(metalmaterialid, obj);

          let metalMaterialData = await MetalMaterial.findById(metalmaterialid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Sub category updated",
            metalMaterialData,
            res
          );
        } else {
          const obj = {
            metalcategoryid: metalcategoryid,
            name: name,
          };
          const metalMaterialData = await MetalMaterial.create(obj);
          await MetalCategory.findByIdAndUpdate(metalcategoryid, {
            $push: { material: { material: metalMaterialData._id } },
          });
          return responseManager.onSuccess(
            "Sub category added successfully",
            metalMaterialData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add category" },
      res
    );
  }
};

exports.removeMetalDiamondType = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { metalcategoryid, metaldiamondtypeid } = req.body;

      if (
        metaldiamondtypeid &&
        metaldiamondtypeid != "" &&
        mongoose.Types.ObjectId.isValid(metaldiamondtypeid) &&
        metalcategoryid &&
        metalcategoryid != "" &&
        mongoose.Types.ObjectId.isValid(metalcategoryid)
      ) {
        const da = await MetalCategory.findByIdAndUpdate(
          metalcategoryid,
          {
            $pull: {
              diamond_type: {
                type: new mongoose.Types.ObjectId(metaldiamondtypeid),
              },
            },
          },
          { new: true }
        );
        await MetalDiamondType.findByIdAndRemove(metaldiamondtypeid);
        return responseManager.onSuccess(
          "Sub category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          {
            message:
              "Invalid category id or sub category id to remove sub category",
          },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove product" },
      res
    );
  }
};

exports.removeMetalMaterial = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { metalcategoryid, metalmaterialid } = req.body;

      if (
        metalmaterialid &&
        metalmaterialid != "" &&
        mongoose.Types.ObjectId.isValid(metalmaterialid) &&
        metalcategoryid &&
        metalcategoryid != "" &&
        mongoose.Types.ObjectId.isValid(metalcategoryid)
      ) {
        const da = await MetalCategory.findByIdAndUpdate(
          metalcategoryid,
          {
            $pull: {
              material: {
                material: new mongoose.Types.ObjectId(metalmaterialid),
              },
            },
          },
          { new: true }
        );
        await MetalMaterial.findByIdAndRemove(metalmaterialid);
        return responseManager.onSuccess(
          "Sub category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          {
            message:
              "Invalid category id or sub category id to remove sub category",
          },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove product" },
      res
    );
  }
};
